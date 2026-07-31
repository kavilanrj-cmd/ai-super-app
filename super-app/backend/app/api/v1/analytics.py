from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.analytics import Analytics
from app.models.chat import Chat, Message
from app.models.document import Document

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_chats = await db.execute(select(func.count(Chat.id)).where(Chat.user_id == current_user.id))
    chat_count = total_chats.scalar() or 0

    chat_ids_subq = select(Chat.id).where(Chat.user_id == current_user.id).scalar_subquery()
    total_messages = await db.execute(select(func.count(Message.id)).where(Message.chat_id.in_(chat_ids_subq)))
    msg_count = total_messages.scalar() or 0

    total_docs = await db.execute(select(func.count(Document.id)).where(Document.user_id == current_user.id))
    doc_count = total_docs.scalar() or 0

    return {
        "total_chats": chat_count,
        "total_messages": msg_count,
        "total_documents": doc_count,
        "active_days": 7
    }

@router.get("/admin")
async def get_admin_analytics(db: AsyncSession = Depends(get_db), admin: User = Depends(get_current_admin)):
    total_users = await db.execute(select(func.count(User.id)))
    total_chats = await db.execute(select(func.count(Chat.id)))
    total_docs = await db.execute(select(func.count(Document.id)))
    return {
        "total_users": total_users.scalar() or 0,
        "total_chats": total_chats.scalar() or 0,
        "total_documents": total_docs.scalar() or 0,
        "active_users_today": 0
    }
