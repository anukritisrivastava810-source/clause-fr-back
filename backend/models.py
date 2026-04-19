from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, index=True)
    summary = Column(Text, nullable=True)
    overall_risk_score = Column(Float, default=0.0)
    
    clauses = relationship("Clause", back_populates="document", cascade="all, delete-orphan")

class Clause(Base):
    __tablename__ = "clauses"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"))
    original_text = Column(Text)
    simplified_text = Column(Text, nullable=True)
    risk_level = Column(String, default="low") # low, medium, high
    risk_score = Column(Float, default=0.0)
    explanation = Column(Text, nullable=True)
    suggestions = Column(Text, nullable=True)
    category = Column(String, nullable=True) # e.g. "liability", "termination"
    order_index = Column(Integer) # For mapping position in doc

    document = relationship("Document", back_populates="clauses")
