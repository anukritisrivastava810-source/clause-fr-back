def merge_risk_evaluations(rule_result: dict, ai_result: dict) -> dict:
    """
    Combines outputs from the regex/parametric rule engine and the generative AI.
    Parametric rules often act as 'guardrails' ensuring that specific risks are NEVER missed.
    Therefore, rule_result risk levels can elevate the AI risk, but not lower it.
    """
    
    # Priority scaling
    risk_weights = {"low": 1, "medium": 5, "high": 10}
    
    ai_level = ai_result.get("risk_level", "low").lower()
    rule_level = rule_result.get("risk_level", "low").lower()
    
    # Highest risk overrides
    final_level = ai_level
    if risk_weights.get(rule_level, 0) > risk_weights.get(ai_level, 0):
        final_level = rule_level
        
    final_score = ai_result.get("risk_score", 0.0)
    if final_level == "high" and final_score < 7.0:
        final_score = 8.5 # bumped by rules
        
    # Merge suggestions
    suggs = []
    if rule_result.get("suggestions"):
        suggs.append(f"[Rule Engine]: {rule_result['suggestions']}")
    if ai_result.get("suggestions"):
        suggs.append(f"[AI Insight]: {ai_result['suggestions']}")
        
    merged = {
        "simplified_text": ai_result.get("simplified_text", ""),
        "risk_level": final_level,
        "risk_score": final_score,
        "explanation": ai_result.get("explanation", ""),
        "suggestions": " ".join(suggs),
        "category": rule_result.get("category") or ai_result.get("category", "")
    }
    
    return merged
