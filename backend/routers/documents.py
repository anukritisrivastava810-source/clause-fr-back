from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter()

@router.get("/documents/{document_id}", response_model=schemas.DocumentResponse)
def get_document_results(document_id: str, db: Session = Depends(get_db)):
    db_doc = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Due to relationship and cascade, it will auto-fetch clauses
    # Make sure they are ordered by order_index
    db_doc.clauses.sort(key=lambda x: x.order_index)
    return db_doc
