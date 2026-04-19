from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import uuid
import asyncio

from services import document_parser, rule_engine, ai_service, scoring_engine

router = APIRouter()

@router.post("/analyze", response_model=schemas.UploadResponse)
async def analyze_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Read File
    file_bytes = await file.read()
    
    # 2. Extract structured clauses (PageIndex Vectorless RAG)
    structural_clauses = document_parser.parse_document_to_index(file_bytes, file.filename)
    
    # Create document record
    doc_id = str(uuid.uuid4())
    db_doc = models.Document(
        id=doc_id,
        filename=file.filename,
        summary="Document is being analyzed..."
    )
    db.add(db_doc)
    db.commit()
    
    # 3. Process each clause (we can do this synchronously for simple setup, but async/parallel is better)
    # Using simple loop for code readability and rate limits avoidance locally
    total_score = 0.0
    
    for i, clause_data in enumerate(structural_clauses):
        clause_text = clause_data["text"]
        page_ctx = clause_data["page_context"]
        
        # Parametric Layer
        rule_res = rule_engine.scan_clause_with_rules(clause_text)
        
        # AI Layer
        ai_res = ai_service.analyze_clause_with_ai(clause_text, page_index_context=page_ctx)
        
        # Merge Layer
        final_res = scoring_engine.merge_risk_evaluations(rule_res, ai_res)
        
        db_clause = models.Clause(
            document_id=doc_id,
            original_text=clause_text,
            simplified_text=final_res["simplified_text"],
            risk_level=final_res["risk_level"],
            risk_score=final_res["risk_score"],
            explanation=final_res["explanation"],
            suggestions=final_res["suggestions"],
            category=final_res["category"],
            order_index=i
        )
        db.add(db_clause)
        total_score += final_res["risk_score"]
        
    # Update doc score and summary
    if len(structural_clauses) > 0:
        db_doc.overall_risk_score = total_score / len(structural_clauses)
        db_doc.summary = "Analysis Complete."
        
    db.commit()
    
    return {"message": "Document processed successfully", "document_id": doc_id}
