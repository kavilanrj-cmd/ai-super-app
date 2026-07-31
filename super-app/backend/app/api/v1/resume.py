from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.services.resume_service import ResumeService
from app.utils.file_handler import save_upload
from typing import Optional

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = await save_upload(file, "resumes")
    result = await ResumeService.analyze_resume(file_path, job_description or "")

    resume = Resume(
        user_id=current_user.id,
        title=file.filename,
        file_path=file_path,
        parsed_text=result["parsed_text"][:5000],
        ats_score=result["ats_score"],
        skills_found=result["skills_found"],
        is_processed=True
    )
    db.add(resume)

    return result

@router.get("/history")
async def get_resume_history(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import select
    result = await db.execute(select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()))
    resumes = result.scalars().all()
    return [
        {
            "id": r.id, "title": r.title, "ats_score": r.ats_score,
            "skills_found": r.skills_found, "created_at": str(r.created_at)
        }
        for r in resumes
    ]

@router.delete("/{resume_id}")
async def delete_resume(resume_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import select
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    await db.delete(resume)
    return {"message": "Resume deleted"}
