import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from app.schemas.api import EmpathyScores
import os

# Global variables to cache the model (so we don't reload it every request)
_tokenizer = None
_model = None

# Path to your trained model
# Since you run uvicorn from 'backend/', this path points to 'backend/saved_models/...'
MODEL_PATH = "saved_models/empathy_scorer"

def get_model_and_tokenizer():
    global _tokenizer, _model
    
    if _model is None:
        print(f"🧠 Loading Fine-Tuned Scorer from {MODEL_PATH}...")
        try:
            # Load the model you just trained
            _tokenizer = DistilBertTokenizer.from_pretrained(MODEL_PATH)
            _model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
            _model.eval() # Set to evaluation mode (faster, no training)
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            print("⚠️ Falling back to dummy mode (Did you train the model?)")
            return None, None
            
    return _tokenizer, _model

def score_message(text: str, context: list) -> EmpathyScores:
    tokenizer, model = get_model_and_tokenizer()
    
    # Fallback if model failed to load
    if model is None:
        return EmpathyScores(
            perspective_taking=0.0, validation=0.0, warmth=0.0, 
            non_judgmental=0.0, supportiveness=0.0
        )

    # 1. Prepare Input
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=128)
    
    # 2. Predict (No Gradients needed for inference)
    with torch.no_grad():
        outputs = model(**inputs)
    
    # 3. Extract Scores
    # The model outputs raw "logits". Since we trained for regression (0.0 to 1.0),
    # these logits are your actual scores.
    scores = outputs.logits[0].tolist() 
    
    # We trained on 2 labels: [Warmth, Validation]
    pred_warmth = max(0.0, min(1.0, scores[0]))      # Clamp between 0 and 1
    pred_validation = max(0.0, min(1.0, scores[1]))  # Clamp between 0 and 1
    
    # 4. Map to the 5-point Schema
    # Since we only trained 2 dimensions, we infer the others logically.
    # This is standard practice in MVPs until you have more data.
    return EmpathyScores(
        warmth=pred_warmth,
        validation=pred_validation,
        perspective_taking=pred_validation,  # Validation requires perspective
        supportiveness=pred_warmth,          # Warmth implies support
        non_judgmental=pred_validation       # Validation implies non-judgment
    )