from pydantic import BaseModel
from typing import List, Optional

class ClauseBase(BaseModel):
    original_text: str
    simplified_text: Optional[str] = None
    risk_level: str = "low"
    risk_score: float = 0.0
    explanation: Optional[str] = None
    suggestions: Optional[str] = None
    category: Optional[str] = None
    order_index: int

class ClauseCreate(ClauseBase):
    pass

class ClauseResponse(ClauseBase):
    id: int
    document_id: str

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    id: str
    filename: str
    summary: Optional[str] = None
    overall_risk_score: float = 0.0

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    clauses: List[ClauseResponse] = []

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    message: str
    document_id: str
