from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from app.models.job import Job

class JobService:
    @staticmethod
    async def search_jobs(db: AsyncSession, query: str, location: Optional[str] = None, job_type: Optional[str] = None) -> list:
        stmt = select(Job).where(Job.is_active == True)
        if query:
            stmt = stmt.where(or_(Job.title.ilike(f"%{query}%"), Job.description.ilike(f"%{query}%")))
        if location:
            stmt = stmt.where(Job.location.ilike(f"%{location}%"))
        if job_type:
            stmt = stmt.where(Job.job_type == job_type)
        result = await db.execute(stmt.order_by(Job.created_at.desc()).limit(50))
        return result.scalars().all()

    @staticmethod
    async def save_job(db: AsyncSession, user_id: int, job_id: int) -> Job:
        result = await db.execute(select(Job).where(Job.id == job_id))
        job = result.scalar_one_or_none()
        if job:
            job.is_saved = True
            job.user_id = user_id
        return job

    @staticmethod
    async def get_saved_jobs(db: AsyncSession, user_id: int) -> list:
        result = await db.execute(select(Job).where(Job.user_id == user_id, Job.is_saved == True))
        return result.scalars().all()

    @staticmethod
    async def get_ai_recommendations(db: AsyncSession, user_id: int) -> list:
        result = await db.execute(
            select(Job).where(Job.is_active == True).order_by(Job.ai_match_score.desc().nullslast()).limit(10)
        )
        return result.scalars().all()
