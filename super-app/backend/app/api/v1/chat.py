from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.chat import ChatCreate, ChatResponse, ChatRename, MessageCreate, MessageResponse
from app.models.user import User
from app.models.chat import Chat, Message
from app.services.chat_service import chat_service
from typing import Optional
from sqlalchemy import select

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/", response_model=ChatResponse)
async def create_chat(data: ChatCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat = await chat_service.create_chat(db, current_user.id, data.title, data.model, data.agent_type)
    return ChatResponse.model_validate(chat)

@router.get("/", response_model=list[ChatResponse])
async def get_chats(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    chats = await chat_service.get_user_chats(db, current_user.id)
    return [ChatResponse.model_validate(c) for c in chats]

@router.get("/{chat_id}/messages", response_model=list[MessageResponse])
async def get_messages(chat_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    messages = await chat_service.get_chat_messages(db, chat_id)
    return [MessageResponse.model_validate(m) for m in messages]

@router.post("/{chat_id}/message")
async def send_message(chat_id: int, data: MessageCreate, current_user: User = Depends(get_current_user)):
    return StreamingResponse(
        chat_service.stream_chat(chat_id, data.content),
        media_type="text/plain"
    )

@router.patch("/{chat_id}", response_model=ChatResponse)
async def rename_chat(chat_id: int, data: ChatRename, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id))
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.title = data.title
    await db.flush()
    await db.refresh(chat)
    return ChatResponse.model_validate(chat)

@router.delete("/{chat_id}")
async def delete_chat(chat_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Chat).where(Chat.id == chat_id, Chat.user_id == current_user.id))
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.is_archived = True
    return {"message": "Chat archived"}
