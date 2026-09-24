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
        return TaskPriority(value)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"priority must be one of: {[p.value for p in TaskPriority]}")

def _parse_status(value: str) -> TaskStatus:
    try:
        return TaskStatus(value)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"status must be one of: {[s.value for s in TaskStatus]}")

@router.post("/")
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = await TaskService.create_task(
        db,
        current_user.id,
        payload.title,
        payload.description,
        _parse_priority(payload.priority),
        _parse_date(payload.due_date),
    )
    return {"id": task.id, "title": task.title, "priority": task.priority.value, "status": task.status.value}

@router.get("/")
async def get_tasks(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = await TaskService.get_user_tasks(db, current_user.id)
    return [
        {
            "id": t.id,
            "title": t.title,
            "status": t.status.value,
            "priority": t.priority.value,
            "due_date": str(t.due_date) if t.due_date else None,
        }
        for t in tasks
    ]

@router.post("/{task_id}/status")
async def update_task_status(task_id: int, payload: StatusUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = await TaskService.update_task_status(db, task_id, current_user.id, _parse_status(payload.status))
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"id": task.id, "status": task.status.value}

@router.post("/generate-from-goal")
async def generate_tasks(payload: GoalRequest, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = await TaskService.generate_tasks_from_goal(db, current_user.id, payload.goal)
    return [{"id": t.id, "title": t.title, "status": t.status.value, "priority": t.priority.value} for t in tasks]