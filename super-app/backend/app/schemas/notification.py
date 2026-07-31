from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: Optional[str] = None
    notification_type: Optional[str] = None
    data: Optional[Any] = None
    is_read: bool
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class NotificationCreate(BaseModel):
    title: str
    message: Optional[str] = None
    notification_type: str = "general"
    data: Optional[Any] = None
