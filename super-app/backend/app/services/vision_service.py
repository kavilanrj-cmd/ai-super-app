import base64
import imghdr
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from app.llm.provider import llm_provider

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}
ALLOWED_IMAGE_MIME = {"image/png", "image/jpeg", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


def _mime_from_ext(filename: str) -> str:
    ext = (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()
    return {
        "png": "image/png",
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "webp": "image/webp",
        "gif": "image/gif",
    }.get(ext, "")


class VisionService:
    async def analyze_image(self, file: UploadFile, prompt: str, system: str | None = None) -> str:
        filename = file.filename or ""
        ext = (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()

        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise HTTPException(status_code=400, detail="Image processing failed: unsupported image format")
        if file.content_type and file.content_type not in ALLOWED_IMAGE_MIME:
            raise HTTPException(status_code=400, detail="Image processing failed: unsupported image type")

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Image processing failed: empty file")
        if len(content) > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="Image processing failed: image too large (limit 10 MB)",
            )

        detected = imghdr.what(None, content)
        if detected not in {"png", "jpeg", "webp", "gif"}:
            raise HTTPException(status_code=400, detail="Image processing failed: unsupported image format")

        mime = _mime_from_ext(filename) or f"image/{detected}"
        image_b64 = base64.b64encode(content).decode("ascii")

        if not settings.GROQ_API_KEY or not settings.groq_api_key_configured:
            raise HTTPException(status_code=503, detail="Image analysis failed: vision model unavailable")

        try:
            return await llm_provider.get_vision_response(
                image_b64=image_b64,
                mime_type=mime,
                prompt=prompt,
                system=system,
            )
        except Exception:
            raise HTTPException(status_code=503, detail="Image analysis failed: vision model unavailable")


vision_service = VisionService()
