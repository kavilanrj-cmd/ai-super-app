import os
import re
import logging
import pdfplumber
from typing import Optional
from app.agents import agent_coordinator
from app.utils.helpers import extract_skills, calculate_ats_score

logger = logging.getLogger("resume_service")

# Patterns that surface the ATS score the AI actually reported inside its
# Markdown analysis (e.g. "ATS Score: 62/100" or "**Score: 35/100**").
# Ordered from most specific to most generic.
ATS_SCORE_PATTERNS = [
    re.compile(r"(?:ats|overall)\s*score\s*[:=]?\s*(\d{1,3})\s*(?:\/|out\s*of)\s*100", re.IGNORECASE),
    re.compile(r"(?:ats|applicant).{0,100}?(\d{1,3})\s*(?:\/|out\s*of)\s*100", re.IGNORECASE),
    re.compile(r"\b(?:score|candidate)\s*[:=]?\s*(\d{1,3})\s*(?:\/|out\s*of)\s*100", re.IGNORECASE),
    re.compile(r"\b(\d{1,3})\s*(?:\/|out\s*of)\s*100\b"),
]


def extract_ats_score(analysis: str) -> Optional[float]:
    """Return the ATS score the AI reported in its analysis, or None if absent."""
    if not analysis:
        return None
    for pattern in ATS_SCORE_PATTERNS:
        match = pattern.search(analysis)
        if match:
            score = int(match.group(1))
            if 0 <= score <= 100:
                return float(score)
    return None

class ResumeService:
    @staticmethod
    async def parse_resume(file_path: str) -> str:
        """Extract text from a resume PDF or DOCX. Never logs the content."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return await ResumeService._parse_pdf(file_path)
        if ext == ".docx":
            return ResumeService._parse_docx(file_path)
        raise ValueError(f"Unsupported file type: {ext}")

    @staticmethod
    async def _parse_pdf(file_path: str) -> str:
        text_parts = []
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text_parts.append(page.extract_text() or "")
        return "\n".join(text_parts)

    @staticmethod
    def _parse_docx(file_path: str) -> str:
        from docx import Document
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text]
        for table in doc.tables:
            for row in table.rows:
                cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                if cells:
                    paragraphs.append(" | ".join(cells))
        return "\n".join(paragraphs)

    @staticmethod
    async def analyze_resume(file_path: str, job_description: str = "") -> dict:
        try:
            text = await ResumeService.parse_resume(file_path)
        except Exception as e:
            logger.error("Resume parsing failed (file=%s): %s", os.path.basename(file_path), e)
            raise
        if not text.strip():
            logger.warning("Resume produced no extractable text (file=%s)", os.path.basename(file_path))
            raise ValueError("No text could be extracted from the uploaded resume.")

        skills = extract_skills(text)

        analysis = await agent_coordinator.process_with_agent(
            "resume",
            f"Analyze this resume and provide ATS score, missing skills, summary, improvements, and keyword analysis:\n\n{text[:3000]}"
        )

        # The authoritative score is the one the AI computed during analysis.
        # Fall back to the keyword-overlap heuristic only when the AI did not
        # report a score (a genuine 0 is only used when the backend actually
        # returned 0).
        ai_ats_score = extract_ats_score(analysis)
        ats_score = ai_ats_score if ai_ats_score is not None else calculate_ats_score(text, job_description)

        return {
            "parsed_text": text,
            "ats_score": ats_score,
            "skills_found": skills,
            "analysis": analysis
        }
