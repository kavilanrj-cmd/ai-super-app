from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class JobResponse(BaseModel):
    id: int
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    industry: Optional[str] = None
    skills_required: Optional[Any] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    is_active: bool
    is_saved: bool
    ai_match_score: Optional[float] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class JobSearchParams(BaseModel):
    query: str
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
