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


# ---------------------------------------------------------------------------
# Simulator schemas — "What Happens If…" engine
# ---------------------------------------------------------------------------

class SimulationImpact(BaseModel):
    financial: str
    legal: str
    user_effect: str


class ClauseSimulation(BaseModel):
    clause_id: int
    clause: str
    simplified: str
    risk_level: str
    category: str
    scenario: str
    timeline: List[str]
    impact: SimulationImpact
    severity_score: float


class SimulateResponse(BaseModel):
    simulations: List[ClauseSimulation]
