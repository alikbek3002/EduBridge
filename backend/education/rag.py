import logging
import os
import requests
from django.conf import settings
from .models import KnowledgeChunk
from .prompts import SYSTEM_RAG

logger = logging.getLogger(__name__)

def get_embedding(text, model="text-embedding-3-small"):
    """
    Get embedding from OpenAI API.
    """
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key:
        return None
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "input": text,
        "model": model
    }
    
    resp = requests.post("https://api.openai.com/v1/embeddings", headers=headers, json=data, timeout=10)
    if resp.status_code == 200:
        return resp.json()["data"][0]["embedding"]
    logger.warning("Embedding error response: %s", resp.text)
    return None

def retrieve_chunks(query, top_k=3):
    """
    Uses pgvector cosine distance to find the most relevant chunks.
    Requires OPENAI_API_KEY to be set.
    """
    query_embedding = get_embedding(query)
    if not query_embedding:
        return []
        
    # L2 distance (<->), Cosine distance (<=>), Inner product (<#>)
    # Here we use cosine distance (<=>) provided by pgvector.django
    # filter to similarity threshold or just order by distance
    try:
        from pgvector.django import CosineDistance
        
        # We order by distance ascending (smallest distance = most similar)
        # CosineDistance: 0 is exactly same, 2 is opposite
        results = KnowledgeChunk.objects.annotate(
            distance=CosineDistance('embedding', query_embedding)
        ).order_by('distance')[:top_k]
        
        return list(results)
    except Exception:
        logger.exception("RAG retrieval error")
        return []

def build_rag_prompt(chunks):
    """
    Builds the system prompt injecting retrieved chunks.
    """
    if not chunks:
        from .prompts import SYSTEM_BASE
        return SYSTEM_BASE
        
    context_text = "\n\n".join(
        f"--- Source: {c.source.title} ---\n{c.content}" for c in chunks
    )
    
    return SYSTEM_RAG.format(context=context_text)
