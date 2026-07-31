from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.task_service import TaskService
from typing import Optional

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/")
async def create_task(title: str, description: Optional[str] = None, priority: str = "medium", due_date: Optional[str] = None, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = await TaskService.create_task(db, current_user.id, title, description, priority, due_date)
    return {"id": task.id, "title": task.title, "priority": task.priority, "status": task.status}

@router.get("/")
async def get_tasks(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = await TaskService.get_user_tasks(db, current_user.id)
    return [{"id": t.id, "title": t.title, "status": t.status, "priority": t.priority, "due_date": str(t.due_date) if t.due_date else None} for t in tasks]

@router.post("/{task_id}/status")
async def update_task_status(task_id: int, status: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = await TaskService.update_task_status(db, task_id, status)
    return {"id": task.id, "status": task.status}

@router.post("/generate-from-goal")
async def generate_tasks(goal: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    tasks = await TaskService.generate_tasks_from_goal(db, current_user.id, goal)
    return [{"id": t.id, "title": t.title, "priority": t.priority} for t in tasks]
