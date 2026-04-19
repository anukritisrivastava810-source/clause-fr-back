from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import analyze, documents, simulate

# Create database tables
@app.on_event("startup")
def startup():
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Legal Document Simplifier API",
    description="API for processing, simplifying, and analyzing risk in legal documents.",
    version="1.0.0"
)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze.router, prefix="/api", tags=["Analyze"])
app.include_router(documents.router, prefix="/api", tags=["Documents"])
app.include_router(simulate.router, prefix="/api", tags=["Simulate"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
