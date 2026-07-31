from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    meeting_date: Optional[str] = None
    duration_minutes: Optional[int] = None
    participants: Optional[list[str]] = None

class MeetingResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    meeting_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    participants: Optional[Any] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    action_items: Optional[Any] = None
    recording_url: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class MeetingSummaryRequest(BaseModel):
    transcript: str
    title: Optional[str] = None

class MeetingSummaryResponse(BaseModel):
    summary: str
    action_items: list[str]
    key_points: list[str]
