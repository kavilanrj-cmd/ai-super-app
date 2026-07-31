import logging
from app.agents import agent_coordinator
from typing import Optional

logger = logging.getLogger(__name__)

class DocumentService:
    @staticmethod
    async def generate_document(doc_type: str, context: dict) -> str:
        ctx_str = context.get("context", str(context))
        user_details = context.get("user_details", "")
        title = context.get("title", "")
        details = f"Title: {title}\nContext: {ctx_str}"
        if user_details:
            details += f"\nUser Details: {user_details}"
        prompts = {
            "resume": f"Generate a professional resume with the following details:\n{details}\n\nInclude sections: Personal Info, Professional Summary, Work Experience, Education, Skills, Certifications, Projects.",
            "cover_letter": f"Generate a professional cover letter with the following details:\n{details}\n\nInclude: Sender/Recipient info, Salutation, Body paragraphs, Closing.",
            "sop": f"Generate a statement of purpose with the following details:\n{details}\n\nInclude: Introduction, Academic Background, Work Experience, Reasons for Applying, Future Goals, Conclusion.",
            "email": f"Generate a professional email with the following details:\n{details}\n\nInclude: Subject line, Salutation, Body, Closing signature.",
            "proposal": f"Generate a business proposal with the following details:\n{details}\n\nInclude: Title, Executive Summary, Problem Statement, Solution, Timeline, Budget, Conclusion.",
            "report": f"Generate a professional report with the following details:\n{details}\n\nInclude: Title, Executive Summary, Introduction, Analysis, Findings, Recommendations, Conclusion.",
        }
        prompt = prompts.get(doc_type, f"Generate a {doc_type} document with:\n{details}")
        logger.info(f"Generating {doc_type} document via agent")
        result = await agent_coordinator.process_with_agent("document", prompt)
        logger.info(f"Agent returned {len(result)} chars")
        return result
