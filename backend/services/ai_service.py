import os
import json
import google.generativeai as genai
from pydantic import BaseModel
from dotenv import load_dotenv
from services.prompt_bank import SYSTEM_GUARDRAILS, CLAUSE_ANALYSIS_PROMPT

load_dotenv()

class AIAnalysisResult(BaseModel):
    simplified_text: str
    risk_level: str
    risk_score: float
    explanation: str
    suggestions: str
    category: str

def setup_ai():
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)

def analyze_clause_with_ai(clause_text: str, page_index_context: str = "Unknown Location") -> dict:
    """
    Sends the clause to Gemini with strict JSON instruction via the prompt bank.
    Includes vectorless contextual grounding (page_index_context).
    """
    setup_ai()
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        user_prompt = CLAUSE_ANALYSIS_PROMPT.format(
            PAGE_INDEX_CONTEXT=page_index_context,
            CLAUSE_TEXT=clause_text
        )
        
        response = model.generate_content([SYSTEM_GUARDRAILS, user_prompt])
        
        # Clean response string to ensure it's JSON
        resp_text = response.text.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(resp_text)
        return parsed
        
    except Exception as e:
        print(f"AI error falling back to dummy: {e}")
        return {
            "simplified_text": "Failed to analyze clause automatically.",
            "risk_level": "low",
            "risk_score": 0.0,
            "explanation": "No explanation available due to AI timeout/error.",
            "suggestions": "Review this clause manually.",
            "category": "Unknown"
        }
