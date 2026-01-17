from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

_tokenizer = None
_model = None
MODEL_PATH = "saved_models/empathy_rewriter"

def get_model():
    global _tokenizer, _model
    if _model is None:
        print(f"✍️ Loading T5 Rewriter from {MODEL_PATH}...")
        try:
            _tokenizer = T5Tokenizer.from_pretrained(MODEL_PATH, legacy=False)
            _model = T5ForConditionalGeneration.from_pretrained(MODEL_PATH)
            _model.eval()
        except Exception as e:
            print(f"❌ Error loading T5 Rewriter: {e}")
            return None, None
    return _tokenizer, _model

def generate_rewrite(text: str, style: str = "gentle") -> str:
    tokenizer, model = get_model()
    
    if model is None:
        return f"[Mock] {text} (Model not loaded)"

    input_text = f"rewrite harsh to polite: {text}"
    
    inputs = tokenizer(
        input_text, 
        return_tensors="pt", 
        max_length=128, 
        truncation=True
    )

    with torch.no_grad():
        outputs = model.generate(
            **inputs, 
            max_length=128, 
            num_beams=5, 
            early_stopping=True,
            min_length=5, # <--- FORCE it to generate at least 5 words
            no_repeat_ngram_size=2
        )

    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return result 