from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.job_service import JobProviderError, JobService
from app.services.job_service import logger

router = APIRouter(prefix="/jobs", tags=["Jobs"])

UNAVAILABLE = "Job search service is currently unavailable. Please try again."

@router.get("/search")
async def search_jobs(
    query: str = Query(..., min_length=1),
    location: Optional[str] = None,
    job_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return await JobService.search_jobs(db, query, location, job_type)
    except JobProviderError as exc:
        logger.warning("JOB SEARCH DEBUG - search failed for query=%r location=%r: %s", query, location, exc)
        raise HTTPException(status_code=503, detail=UNAVAILABLE) from exc
    except Exception:
        logger.exception("JOB SEARCH DEBUG - unexpected error for query=%r location=%r", query, location)
        raise HTTPException(status_code=500, detail=UNAVAILABLE)

@router.get("/saved")
async def get_saved_jobs(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    jobs = await JobService.get_saved_jobs(db, current_user.id)
    return [{"id": j.id, "title": j.title, "company": j.company, "location": j.location} for j in jobs]

@router.post("/{job_id}/save")
async def save_job(job_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = await JobService.save_job(db, current_user.id, job_id)
    return {"message": "Job saved"}

@router.get("/recommendations")
async def get_recommendations(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    jobs = await JobService.get_ai_recommendations(db, current_user.id)
    return [{"id": j.id, "title": j.title, "company": j.company, "score": j.ai_match_score} for j in jobs]
