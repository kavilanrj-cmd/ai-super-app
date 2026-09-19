from pydantic_settings import BaseSettings
from pydantic import ConfigDict, field_validator, model_validator
from typing import Any, Optional
from urllib.parse import urlparse
import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Single source of truth: the project-root `.env` is loaded before any
# model/provider is initialized. This resolves independently of the current
# working directory so the runtime always reads the same configuration.
_BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
_ENV_PATH = _BASE_DIR / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=False)

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=str(_ENV_PATH), env_file_encoding="utf-8", case_sensitive=True, extra="ignore")

    APP_NAME: str = "AI Super App"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./super_app.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY")
    # Single model used by all ChatGroq / Groq calls. Sourced from .env.
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "qwen/qwen3-32b")
    # Multimodal (vision) model used for image describe/caption/OCR tasks.
    # Kept separate from GROQ_MODEL because the chat model is text-only.
    GROQ_VISION_MODEL: str = os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b")

    # ---------- Job Finder ----------
    # Active job provider: "jsearch" (default, RapidAPI) or "adzuna".
    # Credentials are read from the environment; placeholders mean "not set".
    JOB_PROVIDER: str = os.getenv("JOB_PROVIDER", "jsearch")
    JSEARCH_API_KEY: Optional[str] = os.getenv("JSEARCH_API_KEY")
    ADZUNA_APP_ID: Optional[str] = os.getenv("ADZUNA_APP_ID")
    ADZUNA_APP_KEY: Optional[str] = os.getenv("ADZUNA_APP_KEY")

    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")

    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_BUCKET_NAME: Optional[str] = os.getenv("AWS_BUCKET_NAME")
    AWS_REGION: Optional[str] = os.getenv("AWS_REGION", "us-east-1")

    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GITHUB_CLIENT_ID: Optional[str] = os.getenv("GITHUB_CLIENT_ID")

    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", "")
    CELERY_BROKER_URL: Optional[str] = os.getenv("CELERY_BROKER_URL", "")

    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024
    ALLOWED_EXTENSIONS: set = {"pdf", "docx", "txt", "png", "jpg", "jpeg", "gif", "mp3", "wav", "mp4", "csv", "json"}

    RATE_LIMIT: int = 100
    RATE_LIMIT_WINDOW: int = 60

    CORS_ORIGINS: Any = []
    FRONTEND_URL: Optional[str] = os.getenv("FRONTEND_URL")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@superapp.ai")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "Admin@123")

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v):
        if isinstance(v, str):
            if v.startswith("postgres://"):
                return v.replace("postgres://", "postgresql+asyncpg://", 1)
            if v.startswith("postgresql://") and "+" not in v.split("://")[0]:
                return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            try:
                parsed = json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(",") if origin.strip()]
            return parsed if isinstance(parsed, list) else [parsed]
        if isinstance(v, (list, tuple)):
            return list(v)
        return []

    @model_validator(mode="after")
    def configure_cors(self):
        origins = list(self.CORS_ORIGINS or [])
        if self.FRONTEND_URL and self.FRONTEND_URL not in origins:
            origins.append(self.FRONTEND_URL)
        if self.DEBUG:
            # Always allow local development frontend origins (both 3000 and
            # 3001) while DEBUG is on, regardless of the .env CORS_ORIGINS.
            for dev_origin in (
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001",
            ):
                if dev_origin not in origins:
                    origins.append(dev_origin)
        else:
            origins = [o for o in origins if not self._is_localhost_origin(o)]
        self.CORS_ORIGINS = list(dict.fromkeys(origins))
        return self

    @staticmethod
    def _is_localhost_origin(origin: str) -> bool:
        try:
            return urlparse(origin).hostname in ("localhost", "127.0.0.1")
        except ValueError:
            return False

    @model_validator(mode="after")
    def validate_production_security(self):
        insecure_keys = ("super-secret-key-change-in-production", "change-this-to-a-random-secret-key")
        if not self.DEBUG and self.SECRET_KEY in insecure_keys:
            raise ValueError("SECRET_KEY must be set to a strong random value when DEBUG=False")
        return self

    @property
    def groq_api_key_configured(self) -> bool:
        return bool(self.GROQ_API_KEY and "your_groq_api_key" not in self.GROQ_API_KEY)

    @property
    def job_provider_configured(self) -> bool:
        provider = (self.JOB_PROVIDER or "jsearch").strip().lower()
        placeholder = ("your_", "replace_", "change-me", "changeme")
        if provider == "adzuna":
            return bool(
                self.ADZUNA_APP_ID
                and self.ADZUNA_APP_KEY
                and not any(p in str(self.ADZUNA_APP_KEY).lower() for p in placeholder)
            )
        return bool(
            self.JSEARCH_API_KEY
            and not any(p in str(self.JSEARCH_API_KEY).lower() for p in placeholder)
        )

settings = Settings()
