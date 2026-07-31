from typing import Optional, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.chat import Chat, Message
from app.agents import agent_coordinator
from app.llm.provider import llm_provider
from app.core.database import async_session_factory
from datetime import datetime

class ChatService:
    @staticmethod
    async def create_chat(db: AsyncSession, user_id: int, title: Optional[str] = None, model: str = "groq", agent_type: Optional[str] = None) -> Chat:
        chat = Chat(user_id=user_id, title=title or "New Chat", model=model, agent_type=agent_type)
        db.add(chat)
        await db.flush()
        return chat

    @staticmethod
    async def get_user_chats(db: AsyncSession, user_id: int) -> list:
        result = await db.execute(
            select(Chat).where(Chat.user_id == user_id, Chat.is_archived == False).order_by(Chat.updated_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_chat_messages(db: AsyncSession, chat_id: int) -> list:
        result = await db.execute(
            select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
        )
        return result.scalars().all()

    @staticmethod
    async def add_message(db: AsyncSession, chat_id: int, role: str, content: str, content_type: str = "text") -> Message:
        msg = Message(chat_id=chat_id, role=role, content=content, content_type=content_type)
        db.add(msg)
        await db.flush()
        await db.commit()

        chat_result = await db.execute(select(Chat).where(Chat.id == chat_id))
        chat = chat_result.scalar_one()
        chat.updated_at = datetime.utcnow()
        await db.commit()

        return msg

    @staticmethod
    async def stream_chat(chat_id: int, message: str, agent_type: Optional[str] = None) -> AsyncGenerator[str, None]:
        async with async_session_factory() as db:
            await ChatService.add_message(db, chat_id, "user", message)

            chat_result = await db.execute(select(Chat).where(Chat.id == chat_id))
            chat = chat_result.scalar_one()

            messages_result = await db.execute(
                select(Message).where(Message.chat_id == chat_id).order_by(Message.created_at)
            )
            chat_messages = messages_result.scalars().all()

            if chat.agent_type:
                full_response = await agent_coordinator.process_with_agent(chat.agent_type, message)
                words = full_response.split(" ")
                for word in words:
                    yield word + " "
                    import asyncio
                    await asyncio.sleep(0.01)
                await ChatService.add_message(db, chat_id, "assistant", full_response)
            else:
                llm_messages = [{"role": msg.role, "content": msg.content} for msg in chat_messages]
                full_response = ""
                try:
                    async for chunk in llm_provider.get_chat_response(llm_messages, model=chat.model, stream=True):
                        if chunk is not None and chunk != "":
                            full_response += chunk
                            yield chunk
                except Exception as e:
                    error_msg = f"\n\nError: {e}"
                    full_response = error_msg
                    yield error_msg
                await ChatService.add_message(db, chat_id, "assistant", full_response)

chat_service = ChatService()
