from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    category: Optional[str] = None
    due_date: Optional[str] = None
    tags: Optional[list[str]] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    category: Optional[str] = None
    due_date: Optional[str] = None
    tags: Optional[list[str]] = None
    is_ai_generated: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class TaskStatusUpdate(BaseModel):
    status: str

class TaskGenerateFromGoal(BaseModel):
    goal: str
