from fastapi import APIRouter, Depends, UploadFile, File
from app.core.security import get_current_user
from app.models.user import User
from app.utils.file_handler import save_upload

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    file_path = await save_upload(file)
    return {"file_path": file_path, "filename": file.filename}
