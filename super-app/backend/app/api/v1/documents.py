import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document import Document
from app.services.document_service import DocumentService
from app.schemas.document import DocumentGenerateRequest, DocumentGenerateResponse
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/generate", response_model=DocumentGenerateResponse)
async def generate_document(
    data: DocumentGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        logger.info(f"Generating {data.doc_type} document for user {current_user.id}")
        content = await DocumentService.generate_document(data.doc_type, data.context)
        if not content or content.startswith("Unknown agent") or content.startswith("No LLM"):
            logger.error(f"Document generation failed: {content}")
            raise HTTPException(status_code=500, detail=content or "AI returned empty response")
        doc = Document(
            user_id=current_user.id,
            title=f"{data.doc_type} - {data.context.get('title', 'Untitled')}",
            doc_type=data.doc_type,
            content_text=content
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        logger.info(f"Document {doc.id} generated successfully")
        return DocumentGenerateResponse(content=content, id=doc.id)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_documents(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import select
    result = await db.execute(select(Document).where(Document.user_id == current_user.id).order_by(Document.created_at.desc()))
    docs = result.scalars().all()
    return [{"id": d.id, "title": d.title, "doc_type": d.doc_type, "created_at": str(d.created_at)} for d in docs]

@router.delete("/{doc_id}")
async def delete_document(doc_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import select
    result = await db.execute(select(Document).where(Document.id == doc_id, Document.user_id == current_user.id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(doc)
    return {"message": "Document deleted"}
