import re

# --- CONFIGURATION ---
POSITIVE_MARKERS = [
    "please", "thank", "appreciate", "could you", "would you", "help", 
    "understand", "concern", "perspective", "together", "we can"
]

NEGATIVE_MARKERS = [
    "trash", "stupid", "useless", "idiot", "garbage", "waste", 
    "hell", "damn", "worst", "fail", "mess", "ridiculous"
]

def calculate_heuristic_score(text: str) -> float:
    """
    Calculates a deterministic score based on rule-based features.
    Base Score: 0.5 (Neutral)
    Range: 0.0 to 1.0
    """
    text_lower = text.lower()
    score = 0.5  # Start neutral
    
    # 1. Penalty for Toxic Words (-0.15 per word)
    for word in NEGATIVE_MARKERS:
        if word in text_lower:
            score -= 0.15

    # 2. Bonus for Polite Words (+0.10 per word)
    for word in POSITIVE_MARKERS:
        if word in text_lower:
            score += 0.10

    # 3. Penalty for Shouting (All Caps) -> -0.2
    # We check if >50% of characters are upper case and the text is long enough
    if len(text) > 5 and sum(1 for c in text if c.isupper()) / len(text) > 0.5:
        score -= 0.20

    # 4. Penalty for Aggressive Punctuation (Multiple !!! or ???) -> -0.1
    if re.search(r"[?!]{2,}", text):
        score -= 0.10
        
    # 5. Length Penalty (Too short messages tend to be rude) -> -0.05
    if len(text.split()) < 3:
        score -= 0.05

    # Clamp the score between 0.0 and 1.0
    return max(0.01, min(0.99, score))