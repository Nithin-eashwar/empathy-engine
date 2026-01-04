import chromadb
from app.core.config import settings
from typing import List, Dict, Any

_client = None
_collection = None

def get_collection():
    global _client, _collection
    if _collection is None:
        # PersistentClient saves data to disk automatically
        _client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        _collection = _client.get_or_create_collection(name="messages")
    return _collection

def upsert_message(mid: str, text: str, embedding: List[float], metadata: Dict[str, Any]):
    coll = get_collection()
    coll.upsert(
        ids=[mid],
        metadatas=[metadata],
        documents=[text],
        embeddings=[embedding]
    )

def search_context(embedding: List[float], top_k: int = 3) -> List[str]:
    coll = get_collection()
    res = coll.query(
        query_embeddings=[embedding],
        n_results=top_k
    )
    # Return just the text of past messages
    if res and res['documents']:
        return res['documents'][0]
    return []