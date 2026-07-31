from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ResumeResponse(BaseModel):
    id: int
    title: Optional[str] = None
    file_path: Optional[str] = None
    parsed_text: Optional[str] = None
    ats_score: Optional[float] = None
    missing_skills: Optional[Any] = None
    summary: Optional[str] = None
    improvements: Optional[Any] = None
    keyword_analysis: Optional[Any] = None
    skills_found: Optional[Any] = None
    experience_years: Optional[float] = None
    education: Optional[Any] = None
    certifications: Optional[Any] = None
    is_processed: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class ResumeAnalysisResponse(BaseModel):
    parsed_text: str
    ats_score: float
    skills_found: list[str]
    analysis: str
