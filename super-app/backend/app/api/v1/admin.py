from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import User
from app.models.chat import Chat
from app.models.document import Document
from app.models.task import Task

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
async def get_admin_stats(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    users = await db.execute(select(func.count(User.id)))
    chats = await db.execute(select(func.count(Chat.id)))
    docs = await db.execute(select(func.count(Document.id)))
    tasks = await db.execute(select(func.count(Task.id)))
    return {
        "total_users": users.scalar() or 0,
        "total_chats": chats.scalar() or 0,
        "total_documents": docs.scalar() or 0,
        "total_tasks": tasks.scalar() or 0
    }

@router.get("/users")
async def get_all_users(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [{"id": u.id, "email": u.email, "username": u.username, "role": u.role, "is_active": u.is_active, "created_at": str(u.created_at)} for u in users]
