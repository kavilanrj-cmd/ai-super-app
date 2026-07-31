from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime

class DocumentCreate(BaseModel):
    title: str
    doc_type: str
    content_text: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    title: Optional[str] = None
    doc_type: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    content_text: Optional[str] = None
    is_processed: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

class DocumentGenerateRequest(BaseModel):
    doc_type: str
    context: dict
    title: Optional[str] = None

class DocumentGenerateResponse(BaseModel):
    content: str
    id: int
