from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import Response
from app.core.security import get_current_user
from app.models.user import User
from app.agents import agent_coordinator
from app.llm.provider import llm_provider
from app.services.rag_service import RAGService
from app.services.resume_service import ResumeService
from app.services.voice_service import VoiceService
from app.services.vision_service import vision_service
from app.utils.file_handler import save_upload
from app.schemas.ai import (
    AIChatRequest, CodeExplainRequest, CodeFixRequest, CodeGenerateRequest,
    CodeReviewRequest, SummarizeRequest, TranslateRequest, ResearchRequest,
    CareerRoadmapRequest, InterviewQuestionRequest, SalaryPredictionRequest,
    ImageGenerateRequest, WritingRequest, EmailRequest, EmailImproveRequest,
    MeetingSummaryRequest, BugFinderRequest, RagQueryRequest
)
from typing import Optional
import os
import logging

logger = logging.getLogger("ai_api")

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/chat")
async def ai_chat(req: AIChatRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.chat(req.message, req.agent_type)
    return {"response": result}

@router.post("/code/explain")
async def explain_code(req: CodeExplainRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("coding", f"Explain this {req.language} code:\n{req.code}")
    return {"explanation": result}

@router.post("/code/fix")
async def fix_code(req: CodeFixRequest, current_user: User = Depends(get_current_user)):
    prompt = f"Fix bugs in this code:\n{req.code}"
    if req.error:
        prompt += f"\nError: {req.error}"
    result = await agent_coordinator.process_with_agent("coding", prompt)
    return {"fixed_code": result}

@router.post("/code/generate")
async def generate_code(req: CodeGenerateRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("coding", f"Generate {req.language} code for: {req.prompt}")
    return {"code": result}

@router.post("/code/optimize")
async def optimize_code(code: str = Form(...), current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("coding", f"Optimize this code for performance:\n{code}")
    return {"optimized_code": result}

@router.post("/code/convert")
async def convert_code(code: str = Form(...), target_language: str = Form(...), current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("coding", f"Convert this code to {target_language}:\n{code}")
    return {"converted_code": result}

@router.post("/code/review")
async def review_code(req: CodeReviewRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("coding", f"""Review this {req.language} code and provide:
1. Bugs and errors
2. Security vulnerabilities
3. Performance improvements
4. Refactoring suggestions

Code:
{req.code}""")
    return {"review": result}

@router.post("/code/bug-finder")
async def find_bugs(req: BugFinderRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("coding", f"""Analyze this {req.language} code and find:
1. All bugs and logical errors
2. Security vulnerabilities
3. Dead code and unused imports
4. Potential runtime errors

Code:
{req.code}""")
    return {"findings": result}

@router.post("/summarize")
async def summarize_text(req: SummarizeRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("summarizer", f"Summarize this in {req.max_length} words or less:\n{req.text}")
    return {"summary": result}

@router.post("/translate")
async def translate_text(req: TranslateRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("translator", f"Translate from {req.source_language or 'auto'} to {req.target_language}:\n{req.text}")
    return {"translation": result}

@router.post("/research")
async def research_topic(req: ResearchRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("research", f"Research this topic ({req.depth} depth): {req.topic}")
    return {"research": result}

@router.post("/career/roadmap")
async def generate_roadmap(req: CareerRoadmapRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("career", f"Create detailed career roadmap from {req.current_role} to {req.target_role} with timeline, courses, projects, and resources")
    return {"roadmap": result}

@router.post("/career/interview")
async def generate_interview_questions(req: InterviewQuestionRequest, current_user: User = Depends(get_current_user)):
    question_types = ", ".join(req.question_types) if req.question_types else "technical, behavioral, hr"
    result = await agent_coordinator.process_with_agent("career", f"Generate {question_types} interview questions for {req.role} role{f' at {req.company}' if req.company else ''} with answers and tips")
    return {"questions": result}

@router.post("/career/salary")
async def predict_salary(req: SalaryPredictionRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("career", f"Predict salary for {req.role} with {req.experience} years in {req.location}. Skills: {req.skills}. Provide range, factors, and growth trajectory.")
    return {"salary_prediction": result}

@router.post("/image/generate")
async def generate_image(req: ImageGenerateRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("vision", f"Generate a detailed image description/prompt for: {req.prompt}. Style: {req.style if req.style else 'photorealistic'}")
    return {"description": result}

@router.post("/image/describe")
async def describe_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    description = await vision_service.analyze_image(
        file,
        "Describe this image in detail, including the main subject, setting, colors, and any notable details.",
        system="You are a visual analyst. Describe the image you can actually see based on its pixel content.",
    )
    return {"description": description}

@router.post("/image/caption")
async def caption_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    caption = await vision_service.analyze_image(
        file,
        "Generate a short, meaningful caption (one sentence) for this image based on what is actually visible.",
        system="You are a visual analyst. Write your caption strictly from the image content you can see.",
    )
    return {"caption": caption}

@router.post("/ocr")
async def extract_ocr(file: UploadFile = File(...), language: str = Form("eng"), current_user: User = Depends(get_current_user)):
    text = await vision_service.analyze_image(
        file,
        "Extract all visible text from this image. Return exactly the detected text with no extra commentary. "
        "If there is no readable text, respond with exactly: No text detected.",
        system="You are an OCR engine reading the actual pixel content of the image.",
    )
    if not text or text.strip().lower() == "no text detected":
        return {"text": "No text detected.", "words": [], "confidences": []}
    return {"text": text.strip(), "words": [], "confidences": []}

@router.post("/voice/stt")
async def speech_to_text(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    file_path = await save_upload(file, "audio")
    text = await VoiceService.speech_to_text(file_path)
    return {"text": text}

@router.post("/voice/tts")
async def text_to_speech(text: str = Form(...), current_user: User = Depends(get_current_user)):
    try:
        audio = await VoiceService.text_to_speech(text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except RuntimeError as exc:
        logger.error("Voice TTS provider error: %s", exc)
        raise HTTPException(status_code=502, detail="Speech generation failed. Please try again.")
    except Exception as exc:
        logger.error("Voice TTS unexpected error: %s", exc)
        raise HTTPException(status_code=500, detail="Speech generation failed. Please try again.")
    return Response(
        content=audio,
        media_type=VoiceService.audio_content_type(audio),
        headers={"Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"},
    )

@router.post("/rag/process")
async def process_document(request: Request, current_user: User = Depends(get_current_user)):
    content_type = request.headers.get("content-type", "")
    collection_name = ""
    text = ""
    metadata = {}

    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        collection_name = (form.get("collection_name") or "").strip()
        text = (form.get("text") or "").strip()
        file = form.get("file")
        if file is not None and getattr(file, "filename", None):
            if not collection_name:
                raise HTTPException(status_code=400, detail="collection_name is required")
            file_path = await save_upload(file, "rag")
            try:
                text = await ResumeService.parse_resume(file_path)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Could not read document: {e}")
            metadata = {
                "filename": file.filename,
                "file_type": os.path.splitext(file.filename or "")[1].lower().lstrip("."),
            }
    else:
        body = await request.json()
        collection_name = (body.get("collection_name") or "").strip()
        text = (body.get("text") or "").strip()

    if not collection_name:
        raise HTTPException(status_code=400, detail="collection_name is required")
    if not text.strip():
        raise HTTPException(status_code=400, detail="text or a supported document file (pdf/docx/txt) is required")

    chunks = await RAGService.process_document(collection_name, text)
    return {
        "chunks_created": chunks,
        "collection_name": collection_name,
        "metadata": metadata,
        "characters": len(text),
    }

@router.post("/rag/query")
async def query_document(req: RagQueryRequest, current_user: User = Depends(get_current_user)):
    result = await RAGService.query_document(req.collection_name, req.query)
    return result

@router.post("/youtube/summarize")
async def summarize_youtube(url: str = Form(...), current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("summarizer", f"Summarize this YouTube video content from URL: {url}")
    return {"summary": result}

@router.post("/notes")
async def create_ai_notes(topic: str = Form(...), current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("research", f"Create comprehensive well-organized notes on: {topic}")
    return {"notes": result}

@router.post("/mindmap")
async def generate_mindmap(topic: str = Form(...), current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("planning", f"Create a detailed mind map structure (with hierarchy and connections) for: {topic}")
    return {"mindmap": result}

@router.post("/meeting/summarize")
async def summarize_meeting(req: MeetingSummaryRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("summarizer", f"""Summarize this meeting transcript and extract:
1. Executive summary
2. Key discussion points
3. Decisions made
4. Action items with assignees
5. Follow-up meetings needed

Transcript:
{req.transcript}""")
    return {"summary": result}

@router.post("/writing/generate")
async def generate_writing(req: WritingRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("document", f"""Generate {req.content_type} content.
Topic: {req.topic}
Tone: {req.tone}
Keywords to include: {req.keywords or 'None'}
Length: {req.length}

Make it engaging, well-structured, and ready to publish.""")
    return {"content": result}

@router.post("/email/generate")
async def generate_email(req: EmailRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("document", f"""Generate a professional {req.email_type} email.
To: {req.recipient_name or 'Recipient'} ({req.recipient_email or 'email@example.com'})
Subject: {req.subject or 'Not specified'}
Context: {req.context}
Tone: {req.tone}

Make it professional, clear, and effective.""")
    return {"email": result}

@router.post("/email/improve")
async def improve_email(req: EmailImproveRequest, current_user: User = Depends(get_current_user)):
    result = await agent_coordinator.process_with_agent("document", f"""Improve this email. Fix grammar, enhance clarity, and adjust tone to {req.tone}:

{req.email_content}

Provide the improved version and list the changes made.""")
    return {"improved_email": result}

@router.post("/cover-letter/generate")
async def generate_cover_letter(
    job_title: str = Form(...),
    company: str = Form(...),
    skills: str = Form(...),
    experience: str = Form(...),
    tone: str = Form("professional"),
    current_user: User = Depends(get_current_user)
):
    result = await agent_coordinator.process_with_agent("document", f"""Generate a personalized cover letter for:
Job Title: {job_title}
Company: {company}
My Skills: {skills}
My Experience: {experience}
Tone: {tone}

Make it compelling, specific, and tailored to the role.""")
    return {"cover_letter": result}

@router.post("/interview/generate")
async def generate_interview_prep(
    role: str = Form(...),
    company: str = Form(None),
    interview_type: str = Form("technical"),
    experience_level: str = Form("mid"),
    current_user: User = Depends(get_current_user)
):
    result = await agent_coordinator.process_with_agent("career", f"""Generate comprehensive interview preparation for:
Role: {role}
Company: {company or 'General'}
Interview Type: {interview_type}
Experience Level: {experience_level}

Include likely questions, good answers, tips, and what to study.""")
    return {"preparation": result}
