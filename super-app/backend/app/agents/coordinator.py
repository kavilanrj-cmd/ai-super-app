from typing import Optional, Dict, Any
from app.agents.agents import (
    ResumeAgent, CareerAgent, ResearchAgent, CodingAgent,
    MedicalAgent, FinanceAgent, TranslatorAgent, SummarizerAgent,
    DocumentAgent, VisionAgent, PlanningAgent
)

class AgentCoordinator:
    def __init__(self):
        self.agents = {
            "resume": ResumeAgent(),
            "career": CareerAgent(),
            "research": ResearchAgent(),
            "coding": CodingAgent(),
            "medical": MedicalAgent(),
            "finance": FinanceAgent(),
            "translator": TranslatorAgent(),
            "summarizer": SummarizerAgent(),
            "document": DocumentAgent(),
            "vision": VisionAgent(),
            "planning": PlanningAgent(),
        }

    def get_agent(self, agent_type: str):
        return self.agents.get(agent_type)

    async def process_with_agent(self, agent_type: str, task: str, context: Optional[list] = None) -> str:
        agent = self.get_agent(agent_type)
        if not agent:
            return f"Unknown agent type: {agent_type}. Available: {', '.join(self.agents.keys())}"
        return await agent.run(task, context)

    async def process_with_multiple_agents(self, tasks: Dict[str, str]) -> Dict[str, str]:
        results = {}
        for agent_type, task in tasks.items():
            result = await self.process_with_agent(agent_type, task)
            results[agent_type] = result
        return results

    async def chat(self, message: str, agent_type: Optional[str] = None) -> str:
        if agent_type and agent_type in self.agents:
            return await self.process_with_agent(agent_type, message)
        return await self.process_with_agent("resume", message)
