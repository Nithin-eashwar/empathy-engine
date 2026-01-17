import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from app.schemas.api import EmpathyScores
# Import the new Rule Engine
from app.services import heuristic_scorer 

_tokenizer = None
_model = None
MODEL_PATH = "saved_models/empathy_scorer"

# --- WEIGHTS FOR THE FORMULA ---
AI_WEIGHT = 0.60       # The Deep Learning Model (Nuance)
RULE_WEIGHT = 0.40     # The Mathematical Rules (Stability)

def get_model():
    global _tokenizer, _model
    if _model is None:
        try:
            print(f"🧠 Loading Fine-Tuned Scorer from {MODEL_PATH}...")
            _tokenizer = DistilBertTokenizer.from_pretrained(MODEL_PATH)
            _model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
            _model.eval()
        except Exception as e:
            print(f"❌ Error loading Scorer: {e}")
            return None, None
    return _tokenizer, _model

def score_message(text: str, context_texts: list[str] = None) -> EmpathyScores:
    tokenizer, model = get_model()
    
    # 1. Calculate RULE-BASED Score (The "Math" Part)
    heuristic_val = heuristic_scorer.calculate_heuristic_score(text)

    # 2. Calculate AI Score (The "Brain" Part)
    if model is None:
        # Fallback if model fails
        ai_val = 0.5
    else:
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128)
        with torch.no_grad():
            outputs = model(**inputs)
        # Assuming the model was trained to output 2 values (Warmth, Validation)
        # We normalize them to 0-1 range if they aren't already
        logits = outputs.logits.squeeze().tolist()
        
        # If your model outputs raw logits, sigmoid ensures 0-1 range
        # simple sigmoid approximation for demo: 1 / (1 + exp(-x))
        # But since you trained for regression 0-1, we might just clip it.
        # Let's assume raw output is roughly 0-1 from training.
        ai_warmth = max(0, min(1, logits[0])) if isinstance(logits, list) else max(0, min(1, logits))
        ai_validation = max(0, min(1, logits[1])) if isinstance(logits, list) and len(logits) > 1 else ai_warmth

    # 3. APPLY THE FORMULA: Final = (AI * 0.6) + (Rules * 0.4)
    final_warmth = (ai_warmth * AI_WEIGHT) + (heuristic_val * RULE_WEIGHT)
    final_validation = (ai_validation * AI_WEIGHT) + (heuristic_val * RULE_WEIGHT)

    # 4. Map to 5 Dimensions (Feature Correlation)
    return EmpathyScores(
        warmth=final_warmth,
        validation=final_validation,
        perspective_taking=final_validation, 
        supportiveness=final_warmth,          
        non_judgmental=final_validation * 1.1 # Slight boost if validation is high
    )