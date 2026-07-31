from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class ChatCreate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = "groq"
    agent_type: Optional[str] = None

class ChatRename(BaseModel):
    title: str

class ChatResponse(BaseModel):
    id: int
    title: Optional[str] = None
    model: Optional[str] = None
    agent_type: Optional[str] = None
    is_archived: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class MessageCreate(BaseModel):
    content: str
    content_type: Optional[str] = "text"

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    role: str
    content: str
    content_type: Optional[str] = None
    meta_data: Optional[Any] = None
    tokens_used: Optional[int] = 0
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
