"""
scenario_simulator.py
---------------------
"What Happens If…" Simulator Engine

Generates scenario-based outcomes, timeline-based consequences,
risk-driven simulations, and estimated impact for risky contract clauses.

Performance guardrails:
- Only processes medium + high risk clauses (enforced in the router)
- Caches results by a hash of (clause_text + risk_level) — cache survives for the
  lifetime of the server process; cleared on restart.
- Single LLM call per clause (combined prompt) for efficiency.
"""

import os
import json
import hashlib
import google.generativeai as genai
from dotenv import load_dotenv
from services.prompt_bank import SIMULATOR_SYSTEM_PROMPT, SIMULATOR_CLAUSE_PROMPT

load_dotenv()

# ---------------------------------------------------------------------------
# Module-level LRU-style cache: { hash_key -> simulation_dict }
# ---------------------------------------------------------------------------
_simulation_cache: dict[str, dict] = {}


def _cache_key(clause_text: str, risk_level: str) -> str:
    """Returns a short hash key for caching."""
    raw = f"{clause_text.strip()}|{risk_level.lower()}"
    return hashlib.md5(raw.encode()).hexdigest()


def _setup_ai():
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)


# ---------------------------------------------------------------------------
# Core public functions
# ---------------------------------------------------------------------------

def generate_scenario(clause_text: str, category: str, risk_level: str) -> str:
    """
    Returns a plain-English 'what if' narrative for the clause.
    This is a convenience wrapper; `simulate_clause` is preferred.
    """
    result = simulate_clause(clause_text, risk_level, category)
    return result.get("scenario", "Scenario not available.")


def generate_timeline(clause_text: str, category: str, risk_level: str) -> list[str]:
    """
    Returns an ordered list of consequence steps for the clause.
    This is a convenience wrapper; `simulate_clause` is preferred.
    """
    result = simulate_clause(clause_text, risk_level, category)
    return result.get("timeline", [])


def estimate_impact(clause_text: str, risk_level: str, category: str) -> dict:
    """
    Returns the impact breakdown (financial, legal, user_effect).
    This is a convenience wrapper; `simulate_clause` is preferred.
    """
    result = simulate_clause(clause_text, risk_level, category)
    return result.get("impact", {
        "financial": "Not available",
        "legal": "Not available",
        "user_effect": "Not available"
    })


def simulate_clause(
    clause_text: str,
    risk_level: str,
    category: str
) -> dict:
    """
    Core simulation function. Returns the full structured simulation dict:
    {
        "scenario": str,
        "timeline": list[str],
        "impact": {
            "financial": str,
            "legal": str,
            "user_effect": str
        },
        "severity_score": float
    }

    Results are cached by hash of (clause_text + risk_level).
    """
    key = _cache_key(clause_text, risk_level)

    # Cache hit
    if key in _simulation_cache:
        return _simulation_cache[key]

    # Cache miss — call LLM
    _setup_ai()
    try:
        model = genai.GenerativeModel("gemini-1.5-flash-002")

        user_prompt = SIMULATOR_CLAUSE_PROMPT.format(
            CATEGORY=category or "Unknown",
            RISK_LEVEL=risk_level.upper(),
            CLAUSE_TEXT=clause_text.strip()
        )

        response = model.generate_content([SIMULATOR_SYSTEM_PROMPT, user_prompt])

        # Sanitize and parse
        resp_text = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )
        parsed = json.loads(resp_text)

        # Validate / fill missing keys defensively
        result = {
            "scenario": parsed.get("scenario", "No scenario available."),
            "timeline": parsed.get("timeline", []),
            "impact": {
                "financial": parsed.get("impact", {}).get("financial", "Not specified"),
                "legal": parsed.get("impact", {}).get("legal", "Not specified"),
                "user_effect": parsed.get("impact", {}).get("user_effect", "Not specified"),
            },
            "severity_score": float(parsed.get("severity_score", _default_severity(risk_level)))
        }

        _simulation_cache[key] = result
        return result

    except Exception as e:
        err_msg = str(e)
        if "API key was reported as leaked" in err_msg:
            print("\n❌ CRITICAL ERROR: YOUR GEMINI API KEY HAS BEEN REPORTED AS LEAKED AND IS BLOCKED BY GOOGLE.")
            print("Please generate a new API key at https://aistudio.google.com/ and update your .env file.\n")
        else:
            print(f"[ScenarioSimulator] LLM error for clause '{clause_text[:60]}…': {e}")
        fallback = _fallback_simulation(risk_level)
        # Cache fallback to prevent hammering LLM on retries
        _simulation_cache[key] = fallback
        return fallback


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _default_severity(risk_level: str) -> float:
    mapping = {"high": 8.0, "medium": 5.0, "low": 2.0}
    return mapping.get(risk_level.lower(), 3.0)


def _fallback_simulation(risk_level: str) -> dict:
    """Graceful degradation when the LLM fails."""
    severity = _default_severity(risk_level)
    return {
        "scenario": (
            "This clause could have significant consequences depending on circumstances. "
            "You may want to review this carefully with a qualified professional."
        ),
        "timeline": [
            "Step 1: Agreement is signed and clause takes effect",
            "Step 2: Triggering event occurs (as described in clause)",
            "Step 3: Consequences outlined in clause are enforced",
            "Step 4: You must respond or comply accordingly",
        ],
        "impact": {
            "financial": "Potential financial liability — review the clause for specific amounts.",
            "legal": "This clause may create legal obligations or expose you to liability.",
            "user_effect": "Your ability to use the service or product may be affected.",
        },
        "severity_score": severity,
    }
