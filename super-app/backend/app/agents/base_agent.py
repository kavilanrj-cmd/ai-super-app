from typing import Optional, List, Dict, Any
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from app.core.config import settings

class BaseAgent:
    def __init__(self, name: str, role: str, goal: str, backstory: str):
        self.name = name
        self.role = role
        self.goal = goal
        self.backstory = backstory
        self.tools = []
        self.memory = []
        self.llm = self._get_llm()

    def _get_llm(self):
        if settings.GROQ_API_KEY:
            return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7, api_key=settings.GROQ_API_KEY)
        elif settings.OPENAI_API_KEY:
            return ChatOpenAI(model="gpt-4o", temperature=0.7, api_key=settings.OPENAI_API_KEY)
        return None

    def add_tool(self, tool: Any):
        self.tools.append(tool)

    def add_to_memory(self, message: str):
        self.memory.append(message)

    async def run(self, task: str, context: Optional[List[Dict]] = None) -> str:
        if not self.llm:
            return f"{self.name}: No LLM configured"
        messages = [
            {"role": "system", "content": f"You are {self.name}. Role: {self.role}. Goal: {self.goal}. Backstory: {self.backstory}"}
        ]
        if self.memory:
            for m in self.memory[-10:]:
                messages.append({"role": "assistant", "content": m})
        if context:
            for ctx in context:
                messages.append({"role": "user", "content": str(ctx)})
        messages.append({"role": "user", "content": task})
        response = await self.llm.ainvoke(messages)
        result = response.content if hasattr(response, "content") else str(response)
        self.add_to_memory(f"Task: {task[:100]}...\nResponse: {result[:100]}...")
        return result
