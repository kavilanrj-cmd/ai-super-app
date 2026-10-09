from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.task import TaskPriority, TaskStatus
from app.services.task_service import TaskService
from typing import Optional
from datetime import date

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, max_length=20)

class GoalRequest(BaseModel):
    goal: str = Field(..., min_length=1, max_length=2000)

def _parse_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(str(value))
    except ValueError:
        raise HTTPException(status_code=400, detail="due_date must be in YYYY-MM-DD format")

def _parse_priority(value: str) -> TaskPriority:
    try:
        return TaskPriority(value.strip().lower())
    except ValueError:
        raise HTTPException(status_code=422, detail=f"priority must be one of: {[p.value for p in TaskPriority]}")

def _parse_status(value: str) -> TaskStatus:
    try:
        return TaskStatus(value.strip().lower())
    except ValueError:
        raise HTTPException(status_code=422, detail=f"status must be one of: {[s.value for s in TaskStatus]}")

def _serialize_task(t) -> dict:
    status_val = t.status.value if hasattr(t.status, "value") else str(t.status).lower()
    priority_val = t.priority.value if hasattr(t.priority, "value") else str(t.priority).lower()
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "status": status_val,
        "priority": priority_val,
        "due_date": str(t.due_date) if t.due_date else None,
        "created_at": str(t.created_at) if t.created_at else None,
    }

@router.post("/")
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = await TaskService.create_task(
        db,
        current_user.id,
        payload.title,
        payload.description,
        _parse_priority(payload.priority).value,
        _parse_date(payload.due_date),
    )
    return _serialize_task(task)

@router.get("/")
async def get_tasks(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = await TaskService.get_user_tasks(db, current_user.id)
    return [_serialize_task(t) for t in tasks]

@router.post("/{task_id}/status")
async def update_task_status(task_id: int, payload: StatusUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = await TaskService.update_task_status(db, task_id, current_user.id, _parse_status(payload.status).value)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return _serialize_task(task)

@router.post("/generate-from-goal")
async def generate_tasks(payload: GoalRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = await TaskService.generate_tasks_from_goal(db, current_user.id, payload.goal)
    if not tasks:
        raise HTTPException(status_code=400, detail="No actionable tasks could be generated from that goal.")
    return [_serialize_task(t) for t in tasks]