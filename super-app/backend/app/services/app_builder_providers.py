"""AI provider abstraction for the AI App Builder.

The App Builder talks to a *backend* LLM only (FastAPI -> provider), never
directly from the browser. This module defines a small provider interface so
other runtimes can be added without touching the rest of the pipeline.

Groq is the default provider (uses the existing GROQ_API_KEY / GROQ_MODEL from
the backend `.env`, so no local LLM is required). Ollama remains available as
an optional, explicitly-enabled local/offline provider.
"""

from __future__ import annotations

import asyncio
import logging
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, Tuple

import httpx
from app.core.config import settings

logger = logging.getLogger("app_builder.providers")

# Local code generation can be slow on CPU/mixed hardware (Ollama).
DEFAULT_TIMEOUT = 600.0
# Groq is a fast cloud API; a generous-but-bounded cap is plenty.
GROQ_TIMEOUT = 300.0
# Seconds a resolved provider is reused before re-probing availability.
PROVIDER_RESOLVE_TTL = 10.0
# Groq models cap output tokens; keep well under typical limits (16384).
GROQ_MAX_OUTPUT_TOKENS = 15_500
# On-demand Groq tiers cap output tokens/minute. When a 429 is returned, wait
# for the window to roll and retry (bounded) before giving up with a clear error.
GROQ_RATE_LIMIT_RETRIES = 2
GROQ_RATE_LIMIT_RETRY_DELAY = 75.0


class AIProviderError(RuntimeError):
    """Raised when a provider cannot produce a response."""


class AIProvider(ABC):
    """Interface implemented by every App Builder LLM provider."""

    provider_name: str = "base"

    @abstractmethod
    async def check(self) -> Dict[str, Any]:
        """Return a status dict: {ok, provider, base_url, model, message}."""

    @abstractmethod
    async def chat(
        self,
        system: str,
        user: str,
        *,
        json_mode: bool = True,
        temperature: float = 0.3,
        max_tokens: Optional[int] = None,
    ) -> str:
        """Single-turn completion. Returns the raw text (usually JSON)."""


class OllamaProvider(AIProvider):
    provider_name = "ollama"

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        self.base_url = (base_url or settings.OLLAMA_BASE_URL or "http://localhost:11434").rstrip("/")
        self.model = model or settings.OLLAMA_MODEL or "qwen3:8b"
        self.timeout = timeout

    async def _request(self, path: str, payload: Optional[dict] = None) -> Any:
        timeout = httpx.Timeout(self.timeout, connect=5.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            if payload is None:
                resp = await client.get(f"{self.base_url}{path}")
            else:
                resp = await client.post(f"{self.base_url}{path}", json=payload)
            resp.raise_for_status()
            return resp.json()

    async def check(self) -> Dict[str, Any]:
        try:
            tags = await self._request("/api/tags")
        except Exception as exc:
            logger.warning("Ollama not reachable at %s: %s", self.base_url, exc)
            return {
                "ok": False,
                "provider": self.provider_name,
                "base_url": self.base_url,
                "model": self.model,
                "models_installed": [],
                "model_ready": False,
                "message": (
                    "Ollama is not running. Start Ollama to use it as the local AI App Builder. "
                    f"1) Install & start Ollama from https://ollama.com  "
                    f"2) Pull your coding model: `ollama pull {self.model}`  "
                    f"3) Set OLLAMA_MODEL in .env if you use a different model."
                ),
            }
        installed = [m.get("name", "") for m in (tags.get("models") or []) if m.get("name")]
        normalized = self.model
        if ":" not in normalized:
            # Ollama accepts both `qwen3:8b` and `qwen3`.
            normalized_alt = f"{normalized}:latest"
        else:
            normalized_alt = normalized.split(":")[0]
        ready = any(m == self.model or m == normalized_alt or m.split(":")[0] == self.model.split(":")[0] for m in installed)
        if ready:
            return {
                "ok": True,
                "provider": self.provider_name,
                "base_url": self.base_url,
                "model": self.model,
                "models_installed": installed,
                "model_ready": True,
                "message": f"Connected to Ollama ({self.base_url}). Model: {self.model}",
            }
        return {
            "ok": True,
            "provider": self.provider_name,
            "base_url": self.base_url,
            "model": self.model,
            "models_installed": installed,
            "model_ready": False,
            "message": (
                f"Ollama is running, but model '{self.model}' is not installed yet. "
                f"Run: `ollama pull {self.model}` (or set OLLAMA_MODEL= for a model you already have: {', '.join(installed[:5]) or 'none'})."
            ),
        }

    async def chat(
        self,
        system: str,
        user: str,
        *,
        json_mode: bool = True,
        temperature: float = 0.3,
        max_tokens: Optional[int] = None,
    ) -> str:
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "stream": False,
            "options": {"temperature": temperature},
        }
        if json_mode:
            payload["format"] = "json"
        # Qwen3 models have a "thinking" mode in Ollama; keep them focused on
        # producing the JSON payload instead of a reasoning/reflection block.
        base = self.model.split(":")[0].lower()
        if base.startswith("qwen3"):
            payload["think"] = False
        if max_tokens:
            payload["options"]["num_predict"] = max_tokens
        try:
            data = await self._request("/api/chat", payload)
        except httpx.HTTPStatusError as exc:
            raise AIProviderError(f"Ollama request failed ({exc.response.status_code}). {exc.response.text[:300]}")
        except httpx.TimeoutException as exc:
            raise AIProviderError(f"Ollama generation timed out after {self.timeout:.0f}s. Try a smaller app idea or close other programs using the GPU. ({exc.__class__.__name__})")
        except httpx.HTTPError as exc:
            raise AIProviderError(
                f"Ollama is not running. Start Ollama to use the local AI App Builder. ({exc.__class__.__name__})"
            )
        content = ((data.get("message") or {}).get("content") or "").strip()
        if not content:
            raise AIProviderError("Ollama returned an empty response.")
        return content


class GroqProvider(AIProvider):
    """Primary App Builder provider reusing the existing GROQ configuration.

    Uses GROQ_API_KEY / GROQ_MODEL from the backend `.env` only. No local LLM
    is loaded. If Groq is unavailable, `check()` returns `ok=False` with a
    clear message so the UI can surface the problem instead of pretending the
    generation succeeded.
    """

    provider_name = "groq"

    def __init__(self, timeout: float = GROQ_TIMEOUT) -> None:
        self.timeout = timeout
        self.model = settings.GROQ_MODEL or "qwen/qwen3-32b"

    def _client(self):
        from groq import AsyncGroq

        return AsyncGroq(api_key=settings.GROQ_API_KEY, timeout=self.timeout, max_retries=2)

    async def check(self) -> Dict[str, Any]:
        if not settings.groq_api_key_configured:
            return {
                "ok": False,
                "provider": self.provider_name,
                "base_url": "https://api.groq.com",
                "model": self.model,
                "models_installed": [],
                "model_ready": False,
                "message": (
                    "Groq is not configured (no GROQ_API_KEY in the backend .env). "
                    "Add GROQ_API_KEY to use Groq as the App Builder provider."
                ),
            }
        try:
            client = self._client()
            resp = await asyncio.wait_for(client.models.list(), timeout=30.0)
            available = [m.id for m in (getattr(resp, "data", None) or [])]
        except asyncio.TimeoutError:
            return {
                "ok": False,
                "provider": self.provider_name,
                "base_url": "https://api.groq.com",
                "model": self.model,
                "model_ready": False,
                "message": "Groq did not answer the health check in time. Check your network and try again.",
            }
        except Exception as exc:
            logger.warning("Groq health check failed: %s", exc)
            return {
                "ok": False,
                "provider": self.provider_name,
                "base_url": "https://api.groq.com",
                "model": self.model,
                "models_installed": [],
                "model_ready": False,
                "message": f"Groq is unavailable: {_short_error(exc)}",
            }
        norm = self.model.split("/")[-1]
        ready = any(m == self.model or m.split("/")[-1] == norm for m in available)
        if ready:
            return {
                "ok": True,
                "provider": self.provider_name,
                "base_url": "https://api.groq.com",
                "model": self.model,
                "models_installed": available[:50],
                "model_ready": True,
                "message": f"Connected to Groq. Model: {self.model}",
            }
        return {
            "ok": True,
            "provider": self.provider_name,
            "base_url": "https://api.groq.com",
            "model": self.model,
            "models_installed": available[:50],
            "model_ready": False,
            "message": (
                f"GROQ_MODEL '{self.model}' was not found in the models available to your key. "
                f"Available: {', '.join(available[:10]) or 'none'}. Set GROQ_MODEL in .env to a supported model."
            ),
        }

    async def chat(
        self,
        system: str,
        user: str,
        *,
        json_mode: bool = True,
        temperature: float = 0.3,
        max_tokens: Optional[int] = None,
    ) -> str:
        if not settings.groq_api_key_configured:
            raise AIProviderError(
                "Groq is not configured (no GROQ_API_KEY in the backend .env). "
                "Set GROQ_API_KEY to use Groq as the App Builder provider."
            )
        try:
            client = self._client()
        except ImportError as exc:
            raise AIProviderError("Groq SDK is not installed in the backend environment.")
        except Exception as exc:
            raise AIProviderError(f"Groq could not be initialized: {exc}")
        kwargs: Dict[str, Any] = {
            "model": settings.GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": temperature,
            "max_tokens": min(max_tokens or 4096, GROQ_MAX_OUTPUT_TOKENS),
        }
        if json_mode:
            # Prompt already contains the word "json", which Groq's JSON mode
            # requires; force a valid JSON object instead of prose.
            kwargs["response_format"] = {"type": "json_object"}
        # Qwen3-family reasoning models on Groq think by default. Disable that
        # for App Builder calls so no internal reasoning block leaks into the
        # JSON payload and output-token usage stays small (mirrors the
        # `think=False` option the Ollama provider sets for qwen3 models).
        if "qwen3" in settings.GROQ_MODEL.lower():
            kwargs["reasoning_effort"] = "none"
        # On-demand Groq tiers cap output tokens/minute. When a request is
        # rate-limited, wait for the window to roll (bounded) and retry before
        # surfacing a clear error. This keeps the pipeline resilient and never
        # lets a rate limit silently masquerade as a successful generation.
        attempts = 0
        while True:
            attempts += 1
            try:
                resp = await asyncio.wait_for(client.chat.completions.create(**kwargs), timeout=self.timeout)
                break
            except asyncio.TimeoutError:
                raise AIProviderError(f"Groq generation timed out after {self.timeout:.0f}s.")
            except Exception as exc:
                error_text = str(exc)
                if "429" in error_text and attempts <= GROQ_RATE_LIMIT_RETRIES:
                    logger.warning("Groq rate limited (429); waiting %ss before retrying (%d/%d)", GROQ_RATE_LIMIT_RETRY_DELAY, attempts, GROQ_RATE_LIMIT_RETRIES + 1)
                    await asyncio.sleep(GROQ_RATE_LIMIT_RETRY_DELAY)
                    continue
                raise AIProviderError(f"Groq API error: {_short_error(exc)}")
        content = (resp.choices[0].message.content or "").strip()
        if not content:
            raise AIProviderError("Groq returned an empty response.")
        return content


class AppBuilderAIClient:
    """Resolves the active provider for the App Builder.

    Groq is the default. When Groq is unavailable the failure is surfaced as a
    clear error; Ollama is only used when the user configures it explicitly
    (APP_BUILDER_PROVIDER=ollama, or an enabled fallback).
    """

    def __init__(self) -> None:
        # (requested provider, monotonic timestamp, resolved provider)
        self._cached: Optional[Tuple[str, float, AIProvider]] = None
        self._ollama = OllamaProvider()
        self._groq = GroqProvider()

    async def provider(self, *, fresh: bool = False) -> AIProvider:
        requested = (settings.APP_BUILDER_PROVIDER or "groq").strip().lower()
        if not fresh and self._cached is not None:
            cached_requested, cached_at, cached_provider = self._cached
            if requested == cached_requested and time.monotonic() - cached_at < PROVIDER_RESOLVE_TTL:
                return cached_provider
        provider = await self._resolve(requested)
        self._cached = (requested, time.monotonic(), provider)
        return provider

    async def _resolve(self, requested: str) -> AIProvider:
        if requested == "ollama":
            ollama_status = await self._ollama.check()
            if ollama_status.get("ok"):
                return self._ollama
            if settings.APP_BUILDER_GROQ_FALLBACK and settings.groq_api_key_configured:
                logger.info("Ollama unavailable; falling back to Groq for App Builder.")
                return self._groq
            return self._ollama
        # Default: Groq is the primary provider.
        groq_status = await self._groq.check()
        if groq_status.get("ok"):
            return self._groq
        if settings.APP_BUILDER_OLLAMA_FALLBACK:
            ollama_status = await self._ollama.check()
            if ollama_status.get("ok"):
                logger.info("Groq unavailable; using Ollama as the local alternative (enabled by user).")
                return self._ollama
        return self._groq


def _short_error(exc: Exception) -> str:
    """One-line, non-secret-safe error summary for user-facing messages."""
    text = str(exc or exc.__class__.__name__).strip()
    return (text[:400]) or exc.__class__.__name__


app_builder_ai_client = AppBuilderAIClient()