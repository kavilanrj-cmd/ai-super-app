from pydantic import BaseModel
from typing import Optional

class AIChatRequest(BaseModel):
    message: str
    agent_type: Optional[str] = None

class AIChatResponse(BaseModel):
    response: str

class CodeExplainRequest(BaseModel):
    code: str
    language: str = "python"

class CodeFixRequest(BaseModel):
    code: str
    error: Optional[str] = None

class CodeGenerateRequest(BaseModel):
    prompt: str
    language: str = "python"

class CodeReviewRequest(BaseModel):
    code: str
    language: str = "python"

class CodeReviewResponse(BaseModel):
    review: str
    bugs: list[str] = []
    security_issues: list[str] = []
    performance_suggestions: list[str] = []
    refactoring_suggestions: list[str] = []

class SummarizeRequest(BaseModel):
    text: str
    max_length: Optional[int] = 500

class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: Optional[str] = None

class ResearchRequest(BaseModel):
    topic: str
    depth: Optional[str] = "medium"

class CareerRoadmapRequest(BaseModel):
    current_role: str
    target_role: str

class InterviewQuestionRequest(BaseModel):
    role: str
    company: Optional[str] = None
    question_types: Optional[list[str]] = None

class SalaryPredictionRequest(BaseModel):
    role: str
    experience: int
    location: str
    skills: str

class ImageGenerateRequest(BaseModel):
    prompt: str
    style: Optional[str] = None

class WritingRequest(BaseModel):
    content_type: str
    topic: str
    tone: Optional[str] = "professional"
    keywords: Optional[str] = None
    length: Optional[str] = "medium"

class EmailRequest(BaseModel):
    email_type: str
    recipient_name: Optional[str] = None
    recipient_email: Optional[str] = None
    subject: Optional[str] = None
    context: str
    tone: Optional[str] = "professional"

class EmailImproveRequest(BaseModel):
    email_content: str
    tone: Optional[str] = "professional"

class MeetingSummaryRequest(BaseModel):
    transcript: str

class BugFinderRequest(BaseModel):
    code: str
    language: str = "python"

class RagQueryRequest(BaseModel):
    collection_name: str
    query: str

class RagProcessRequest(BaseModel):
    collection_name: str
    text: str
