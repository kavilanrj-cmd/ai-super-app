import os
import aiofiles
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import uuid

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt", "png", "jpg", "jpeg", "gif", "mp3", "wav", "mp4", "csv", "json"}

async def save_upload(file: UploadFile, subdir: str = "") -> str:
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed")

    upload_dir = os.path.join(settings.UPLOAD_DIR, subdir)
    os.makedirs(upload_dir, exist_ok=True)

    unique_name = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(upload_dir, unique_name)

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    return file_path

async def delete_file(file_path: str):
    if os.path.exists(file_path):
        os.remove(file_path)
