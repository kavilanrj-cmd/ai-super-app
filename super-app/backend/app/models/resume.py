from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255))
    file_path = Column(String(500))
    parsed_text = Column(Text)
    ats_score = Column(Float)
    missing_skills = Column(JSON, default=list)
    summary = Column(Text)
    improvements = Column(JSON, default=list)
    keyword_analysis = Column(JSON, default=dict)
    skills_found = Column(JSON, default=list)
    experience_years = Column(Float)
    education = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="resumes")
