from typing import Optional, AsyncGenerator
from app.core.config import settings
from groq import AsyncGroq
from openai import AsyncOpenAI

class LLMProvider:
    def __init__(self):
        self.groq_client = None
        self.openai_client = None
        self._init_clients()

    def _init_clients(self):
        if settings.GROQ_API_KEY:
            self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        if settings.OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def get_chat_response(
        self,
        messages: list,
        model: str = "groq",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = False
    ) -> AsyncGenerator[str, None]:
        if model == "groq" and self.groq_client:
            groq_stream = await self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream
            )
            if stream:
                async for chunk in groq_stream:
                    yield chunk.choices[0].delta.content or ""
            else:
                yield groq_stream.choices[0].message.content or ""
        elif self.openai_client:
            openai_stream = await self.openai_client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream
            )
            if stream:
                async for chunk in openai_stream:
                    yield chunk.choices[0].delta.content or ""
            else:
                yield openai_stream.choices[0].message.content or ""
        else:
            yield "No AI provider configured. Please set GROQ_API_KEY or OPENAI_API_KEY."

    async def generate_embedding(self, text: str) -> list:
        if self.openai_client:
            response = await self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        return []

llm_provider = LLMProvider()
