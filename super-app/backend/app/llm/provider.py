from typing import Optional, AsyncGenerator
from app.core.config import settings
from groq import AsyncGroq

class LLMProvider:
    def __init__(self):
        self.groq_client = None
        self._init_clients()

    def _init_clients(self):
        if settings.GROQ_API_KEY:
            self.groq_client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def get_vision_response(
        self,
        image_b64: str,
        mime_type: str,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.4,
        max_tokens: int = 1024,
    ) -> str:
        """Send an actual image (base64 data URL) to the Groq vision model.

        Returns the model's text response. Raises RuntimeError if no Groq
        client is configured or the vision call fails.
        """
        if not self.groq_client:
            raise RuntimeError("vision model unavailable")
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{image_b64}"},
                },
                {"type": "text", "text": prompt},
            ],
        })
        resp = await self.groq_client.chat.completions.create(
            model=settings.GROQ_VISION_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return resp.choices[0].message.content or ""

    async def get_chat_response(
        self,
        messages: list,
        model: str = "groq",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = False
    ) -> AsyncGenerator[str, None]:
        if self.groq_client:
            # Model name comes exclusively from settings.GROQ_MODEL (.env).
            groq_stream = await self.groq_client.chat.completions.create(
                model=settings.GROQ_MODEL,
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
        else:
            yield "No AI provider configured. Please set GROQ_API_KEY in .env."

    async def generate_embedding(self, text: str) -> list:
        return []

llm_provider = LLMProvider()
