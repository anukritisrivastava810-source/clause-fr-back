import re

# Configurable JSON-like structure for rules
RISK_RULES = [
    {
        "category": "Data Privacy",
        "keywords": ["share data", "third party", "sell data", "affiliates"],
        "regex": r"(?i)\b(share|sell|transfer)[\w\s]{0,20}(data|information)\b",
        "risk_level": "high",
        "suggestion": "Ensure there is an opt-out clause for third-party data sharing."
    },
    {
        "category": "Unlimited Liability",
        "keywords": ["maximum extent permitted by law", "disclaims all liability"],
        "regex": r"(?i)(shall not be liable|no liability|maximum extent)",
        "risk_level": "high",
        "suggestion": "Require a liability cap equivalent to the fees paid under this agreement."
    },
    {
        "category": "Auto-Renewal",
        "keywords": ["automatic renewal", "automatically renews", "without notice"],
        "regex": r"(?i)automatically renew[\w\s]{0,20}(successive|term)",
        "risk_level": "medium",
        "suggestion": "Ensure the renewal is subject to prior written notice of at least 30 days."
    },
    {
        "category": "Jurisdiction Trap",
        "keywords": ["exclusive jurisdiction", "governed by the laws of"],
        "regex": r"(?i)(exclusive jurisdiction|courts of|laws of)",
        "risk_level": "medium",
        "suggestion": "Verify that the jurisdiction is mutually convenient and not heavily biased."
    }
]

def scan_clause_with_rules(clause_text: str) -> dict:
    """
    Scans a single clause text against our parametric risk rules.
    Returns the highest risk found and suggestions if any rule triggers.
    """
    text_lower = clause_text.lower()
    triggered_rules = []
    
    for rule in RISK_RULES:
        match_found = False
        
        # Check regex
        if rule.get("regex") and re.search(rule["regex"], clause_text):
            match_found = True
            
        # Check keywords
        if not match_found and rule.get("keywords"):
            if any(kw.lower() in text_lower for kw in rule["keywords"]):
                match_found = True
                
        if match_found:
            triggered_rules.append(rule)
            
    if not triggered_rules:
        return {"risk_level": "low", "category": None, "suggestions": None}
        
    # Determine highest risk
    has_high = any(r["risk_level"] == "high" for r in triggered_rules)
    has_med = any(r["risk_level"] == "medium" for r in triggered_rules)
    
    highest_level = "high" if has_high else "medium" if has_med else "low"
    
    # Collect suggestions and categories
    cats = list(set([r["category"] for r in triggered_rules]))
    suggs = " ".join([r["suggestion"] for r in triggered_rules])
    
    return {
        "risk_level": highest_level,
        "category": ", ".join(cats),
        "suggestions": suggs
    }
