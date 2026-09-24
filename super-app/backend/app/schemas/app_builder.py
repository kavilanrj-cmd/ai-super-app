from pydantic import BaseModel, Field
from typing import Optional


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    template: Optional[str] = None


class IterateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)


class FileReadRequest(BaseModel):
    path: str = Field(..., min_length=1)


class RenameRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)


class DuplicateRequest(BaseModel):
    name: Optional[str] = Field(None, max_length=120)


class RepairRequest(BaseModel):
    errors: str = Field("", max_length=20000)