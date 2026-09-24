"""AI provider abstraction for the AI App Builder.

The App Builder talks to a *backend* LLM only (FastAPI -> Ollama), never
directly from the browser. This module defines a small provider interface so
other runtimes (Groq, OpenAI, Anthropic) can be added later without touching
the rest of the pipeline.

Ollama is the default and requires no API token.
"""

from __future__ import annotations

import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

import httpx
from app.core.config import settings

logger = logging.getLogger("app_builder.providers")

DEFAULT_TIMEOUT = 600.0  # local code generation can be slow (CPU/mixed)


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
                    "Ollama is not running. Start Ollama to use local AI App Builder. "
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
                f"Ollama is not running. Start Ollama to use local AI App Builder. ({exc.__class__.__name__})"
            )
        content = ((data.get("message") or {}).get("content") or "").strip()
        if not content:
            raise AIProviderError("Ollama returned an empty response.")
        return content


class GroqProvider(AIProvider):
    """Optional fallback that reuses the existing GROQ configuration.

    Not required for the App Builder to work, but lets the pipeline keep
    functioning on machines without Ollama when a GROQ_API_KEY is present.
    """

    provider_name = "groq"

    def __init__(self, timeout: float = DEFAULT_TIMEOUT) -> None:
        self.timeout = timeout

    async def check(self) -> Dict[str, Any]:
        if not settings.groq_api_key_configured:
            return {
                "ok": False,
                "provider": self.provider_name,
                "model": settings.GROQ_MODEL,
                "message": "Groq fallback is not configured (no GROQ_API_KEY).",
            }
        return {
            "ok": True,
            "provider": self.provider_name,
            "model": settings.GROQ_MODEL,
            "message": "Groq fallback available.",
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
        try:
            from groq import AsyncGroq
        except ImportError as exc:
            raise AIProviderError("Groq SDK is not installed.")
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        try:
            resp = await asyncio.wait_for(
                client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens or 4096,
                ),
                timeout=self.timeout,
            )
        except Exception as exc:
            raise AIProviderError(f"Groq request failed: {exc}")
        return (resp.choices[0].message.content or "").strip()


class AppBuilderAIClient:
    """Resolves the active provider for the App Builder."""

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None
        # Runs best with Ollama; falls back to Groq only when Ollama is
        # unreachable and the existing GROQ_API_KEY is configured.
        self._ollama = OllamaProvider()
        self._groq = GroqProvider()

    async def provider(self) -> AIProvider:
        requested = (settings.APP_BUILDER_PROVIDER or "ollama").strip().lower()
        if requested == "groq":
            status = await self._groq.check()
            if status.get("ok"):
                return self._groq
            return self._ollama
        # Default: Ollama first, plus an optional Groq fallback when enabled.
        status = await self._ollama.check()
        if status.get("ok"):
            return self._ollama
        if settings.APP_BUILDER_GROQ_FALLBACK and settings.groq_api_key_configured:
            logger.info("Ollama unavailable; falling back to Groq for App Builder.")
            return self._groq
        return self._ollama


app_builder_ai_client = AppBuilderAIClient()