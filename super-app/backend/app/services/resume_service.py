import pdfplumber
from typing import Optional
from app.agents import agent_coordinator
from app.utils.helpers import extract_skills, calculate_ats_score

class ResumeService:
    @staticmethod
    async def parse_pdf(file_path: str) -> str:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text

    @staticmethod
    async def analyze_resume(file_path: str, job_description: str = "") -> dict:
        text = await ResumeService.parse_pdf(file_path)

        skills = extract_skills(text)
        ats_score = calculate_ats_score(text, job_description)

        analysis = await agent_coordinator.process_with_agent(
            "resume",
            f"Analyze this resume and provide ATS score, missing skills, summary, improvements, and keyword analysis:\n\n{text[:3000]}"
        )

        return {
            "parsed_text": text,
            "ats_score": ats_score,
            "skills_found": skills,
            "analysis": analysis
        }
