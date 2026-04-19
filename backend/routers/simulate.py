"""
routers/simulate.py
-------------------
POST /api/simulate

Accepts a document_id and optional top_n (default 5).
Filters medium + high risk clauses, runs the scenario simulator,
and returns structured simulation JSON for each clause.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services import scenario_simulator

router = APIRouter()


class SimulateRequest(BaseModel):
    document_id: str
    top_n: int = 5


@router.post("/simulate", response_model=schemas.SimulateResponse)
def simulate_document(request: SimulateRequest, db: Session = Depends(get_db)):
    """
    Simulate consequences for the top N medium/high risk clauses of a document.

    - Reads clause data from the DB (no re-upload needed)
    - Filters to medium + high risk only
    - Sorts by risk_score descending, takes top_n
    - Calls scenario_simulator.simulate_clause() for each (cached)
    - Returns a list of ClauseSimulation objects
    """
    # Validate document exists
    db_doc = (
        db.query(models.Document)
        .filter(models.Document.id == request.document_id)
        .first()
    )
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Filter medium + high risk clauses
    risky_clauses = [
        c for c in db_doc.clauses
        if c.risk_level in ("medium", "high")
    ]

    if not risky_clauses:
        return schemas.SimulateResponse(simulations=[])

    # Sort by risk_score descending, limit to top_n
    top_clauses = sorted(risky_clauses, key=lambda c: c.risk_score, reverse=True)[: request.top_n]

    simulations: list[schemas.ClauseSimulation] = []

    for clause in top_clauses:
        sim = scenario_simulator.simulate_clause(
            clause_text=clause.original_text,
            risk_level=clause.risk_level,
            category=clause.category or "Unknown",
        )

        simulations.append(
            schemas.ClauseSimulation(
                clause_id=clause.id,
                clause=clause.original_text,
                simplified=clause.simplified_text or "",
                risk_level=clause.risk_level,
                category=clause.category or "Unknown",
                scenario=sim["scenario"],
                timeline=sim["timeline"],
                impact=schemas.SimulationImpact(
                    financial=sim["impact"]["financial"],
                    legal=sim["impact"]["legal"],
                    user_effect=sim["impact"]["user_effect"],
                ),
                severity_score=sim["severity_score"],
            )
        )

    return schemas.SimulateResponse(simulations=simulations)
