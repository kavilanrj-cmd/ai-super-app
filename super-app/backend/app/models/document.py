from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255))
    doc_type = Column(String(100))
    file_path = Column(String(500))
    file_size = Column(Integer)
    file_type = Column(String(50))
    content_text = Column(Text)
    meta_data = Column(JSON, default=dict)
    is_processed = Column(Boolean, default=False)
    processing_result = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="documents")
