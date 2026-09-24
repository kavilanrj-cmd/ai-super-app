from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.task import Task, TaskPriority, TaskStatus
from app.agents import agent_coordinator
from typing import Optional
from datetime import date

class TaskService:
    @staticmethod
    async def create_task(db: AsyncSession, user_id: int, title: str, description: Optional[str] = None, priority: str = "medium", due_date: Optional[str] = None) -> Task:
        try:
            priority_enum = TaskPriority(priority) if isinstance(priority, str) else priority
        except ValueError:
            priority_enum = TaskPriority.MEDIUM
        due: Optional[date] = None
        if isinstance(due_date, str) and due_date:
            try:
                due = date.fromisoformat(due_date)
            except ValueError:
                due = None
        elif isinstance(due_date, date):
            due = due_date
        task = Task(user_id=user_id, title=title, description=description, priority=priority_enum, due_date=due)
        db.add(task)
        await db.flush()
        return task

    @staticmethod
    async def get_user_tasks(db: AsyncSession, user_id: int) -> list:
        result = await db.execute(select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc()))
        return result.scalars().all()

    @staticmethod
    async def update_task_status(db: AsyncSession, task_id: int, user_id: int, status: str) -> Task:
        try:
            status_enum = TaskStatus(status) if isinstance(status, str) else status
        except ValueError:
            status_enum = TaskStatus.TODO
        result = await db.execute(select(Task).where(Task.id == task_id, Task.user_id == user_id))
        task = result.scalar_one_or_none()
        if task:
            task.status = status_enum
        return task

    @staticmethod
    async def generate_tasks_from_goal(db: AsyncSession, user_id: int, goal: str) -> list:
        result = await agent_coordinator.process_with_agent(
            "planning",
            f"Break down this goal into actionable tasks with priorities:\n{goal}"
        )
        tasks = []
        lines = result.split("\n")
        for line in lines:
            if line.strip() and len(line.strip()) > 10:
                task = await TaskService.create_task(db, user_id, line.strip()[:255])
                task.is_ai_generated = True
                tasks.append(task)
        return tasks
