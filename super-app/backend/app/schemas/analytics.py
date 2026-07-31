from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class AnalyticsResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    event_type: str
    event_data: Optional[Any] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class DashboardResponse(BaseModel):
    total_chats: int = 0
    total_messages: int = 0
    total_documents: int = 0
    active_days: int = 0

class AdminAnalyticsResponse(BaseModel):
    total_users: int = 0
    total_chats: int = 0
    total_documents: int = 0
    active_users_today: int = 0
