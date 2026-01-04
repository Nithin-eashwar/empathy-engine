from app.schemas.api import Issue

# A simple but effective list of toxic phrases for the MVP
TOXIC_KEYWORDS = {
    "trash": "Degrading language",
    "garbage": "Degrading language",
    "stupid": "Insulting adjective",
    "idiot": "Personal attack",
    "useless": "Personal attack",
    "dumb": "Insulting adjective",
    "fired": "Threatening language",
    "hate": "Strong negative emotion",
    "kill": "Violent language",
    "always": "Absolutism (triggers defensiveness)",
    "never": "Absolutism (triggers defensiveness)"
}

def detect_issues(text: str) -> list[Issue]:
    issues = []
    lower_text = text.lower()
    
    # 1. Keyword Scanning
    for word, category in TOXIC_KEYWORDS.items():
        if word in lower_text:
            issues.append(Issue(
                span=word,
                issue=category,
                explanation=f"Using words like '{word}' tends to escalate conflict."
            ))

    # 2. Tone Checks (Heuristics)
    if text.isupper():
        issues.append(Issue(
            span="ENTIRE TEXT",
            issue="Shouting (All Caps)",
            explanation="Typing in all caps is perceived as shouting."
        ))
        
    return issues