from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any

# --- INPUTS ---
class ProcessRequest(BaseModel):
    conversation_id: Optional[int] = None
    sender: str = "user"
    text: str
    target_style: str = "gentle"
    style: str = "Diplomat"  # Persona style: Diplomat, Gen Z, Executive, Victorian


# --- OUTPUT COMPONENTS ---
class Issue(BaseModel):
    span: str
    issue: str
    explanation: Optional[str] = None

class EmpathyScores(BaseModel):
    perspective_taking: float
    validation: float
    warmth: float
    non_judgmental: float
    supportiveness: float

class RewriteOption(BaseModel):
    style: str
    text: str

# --- FINAL RESPONSE ---
class ProcessResponse(BaseModel):
    # This prevents crashes if we add extra debug fields later
    model_config = ConfigDict(extra='ignore') 
    
    conversation_id: int
    message_id: str
    original_text: str
    retrieved_context: List[str] # Simplified for frontend display
    empathy_scores: EmpathyScores
    issues: List[Issue]
    rewrites: List[RewriteOption]


# --- FEEDBACK (RLHF) ---
class FeedbackRequest(BaseModel):
    """Request model for RLHF feedback submission"""
    message_id: str
    rating: int  # 1 for positive, -1 for negative
    user_correction: Optional[str] = None  # User's improved version (for negative feedback)


class FeedbackResponse(BaseModel):
    """Response model for feedback submission"""
    success: bool
    message: str
    feedback_id: str
