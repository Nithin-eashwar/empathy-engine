from sentence_transformers import SentenceTransformer

_model = None

def get_model():
    global _model
    if _model is None:
        print("📥 Loading Embedding Model (MiniLM)...")
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def generate_embedding(text: str):
    model = get_model()
    # Convert to standard list for JSON/DB compatibility
    return model.encode(text).tolist()