from fastapi import APIRouter, HTTPException
from app.schemas.api import ProcessRequest, ProcessResponse, RewriteOption, FeedbackRequest, FeedbackResponse
# Consolidated imports
from app.services import embeddings, vectorstore, scorer, issue_detector, rewriter, style_transfer


import uuid
import json
import os
from datetime import datetime

router = APIRouter()

@router.post("/analyze", response_model=ProcessResponse)
async def analyze(request: ProcessRequest):
    try:
        # --- STEP 0: DEMOJIZATON ---
        # (REMOVED: Emoji handling caused issues. Using raw text.)
        clean_text = request.text
        
        # 1. Vectorize (Use clean_text so emojis influence the vector)
        vector = embeddings.generate_embedding(clean_text)
        
        # 2. Retrieve Context
        context = vectorstore.search_context(vector)
        
        # 3. Save User Input to Memory
        # We save the ORIGINAL text (with emojis) so the history looks correct to the user.
        msg_id = str(uuid.uuid4())
        vectorstore.upsert_message(
            mid=msg_id,
            text=request.text,  # Save original
            embedding=vector,
            metadata={"sender": request.sender}
        )
        
        # 4. Score (Use clean_text so BERT understands the emotion)
        scores = scorer.score_message(clean_text, context)
        
        # 5. Detect Issues (Use ORIGINAL text)
        # We check the original so we can catch specific toxic emojis like 🖕 or 🤬
        issues = issue_detector.detect_issues(request.text)
        
        # 6. Generate Rewrites
        # Pass clean_text so T5 doesn't get confused by unknown characters
        ai_rewrite_text = rewriter.generate_rewrite(clean_text)
        
        # 7. Apply Style Transfer
        # Transform the T5 output to the requested persona style
        styled_text = style_transfer.apply_style(ai_rewrite_text, request.style)
        
        # Determine the style label for display
        style_label = f"{request.style}" if request.style != "Diplomat" else "Empathetic (AI)"
        
        rewrites = [
            RewriteOption(style=style_label, text=styled_text),
        ]

        
        return ProcessResponse(
            conversation_id=request.conversation_id or 0,
            message_id=msg_id,
            original_text=request.text,
            retrieved_context=context,
            empathy_scores=scores,
            issues=issues,
            rewrites=rewrites
        )

    except Exception as e:
        print(f"Server Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/styles")
async def get_styles():
    """
    Get available persona/style options for rewrites.
    """
    return {
        "styles": style_transfer.get_available_styles(),
        "default": "Diplomat"
    }


# --- FEEDBACK FILE PATH ---
FEEDBACK_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "data", "feedback.jsonl")



@router.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(request: FeedbackRequest):
    """
    Submit RLHF feedback for model improvement.
    
    - **message_id**: The ID of the message being rated
    - **rating**: 1 for positive (thumbs up), -1 for negative (thumbs down)
    - **user_correction**: Optional improved version from the user (for negative feedback)
    """
    try:
        feedback_id = str(uuid.uuid4())
        
        # Create feedback record
        feedback_record = {
            "feedback_id": feedback_id,
            "message_id": request.message_id,
            "rating": request.rating,
            "user_correction": request.user_correction,
            "timestamp": datetime.utcnow().isoformat(),
        }
        
        # Ensure data directory exists
        os.makedirs(os.path.dirname(FEEDBACK_FILE), exist_ok=True)
        
        # Append to JSONL file (one JSON object per line for easy processing)
        with open(FEEDBACK_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_record) + "\n")
        
        # Log the feedback for monitoring
        feedback_type = "positive" if request.rating > 0 else "negative"
        print(f"[RLHF Feedback] {feedback_type}: message_id={request.message_id}")
        if request.user_correction:
            print(f"   User correction: {request.user_correction[:100]}...")

        
        return FeedbackResponse(
            success=True,
            message=f"Thank you for your {feedback_type} feedback!",
            feedback_id=feedback_id
        )
        
    except Exception as e:
        print(f"Feedback Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/feedback/stats")
async def get_feedback_stats():
    """
    Get statistics on collected RLHF feedback.
    """
    try:
        if not os.path.exists(FEEDBACK_FILE):
            return {
                "total_feedback": 0,
                "positive_count": 0,
                "negative_count": 0,
                "corrections_count": 0
            }
        
        positive_count = 0
        negative_count = 0
        corrections_count = 0
        
        with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    record = json.loads(line)
                    if record.get("rating", 0) > 0:
                        positive_count += 1
                    else:
                        negative_count += 1
                    if record.get("user_correction"):
                        corrections_count += 1
        
        return {
            "total_feedback": positive_count + negative_count,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "corrections_count": corrections_count
        }
        
    except Exception as e:
        print(f"Stats Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
