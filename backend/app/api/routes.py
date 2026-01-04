from fastapi import APIRouter, HTTPException
from app.schemas.api import ProcessRequest, ProcessResponse, RewriteOption
# Consolidated imports
from app.services import embeddings, vectorstore, scorer, issue_detector, rewriter
import emoji
import uuid

router = APIRouter()

@router.post("/analyze", response_model=ProcessResponse)
async def analyze(request: ProcessRequest):
    try:
        # --- STEP 0: DEMOJIZATON ---
        # Convert "😡" to ":pouting_face:" so the AI understands the emotion.
        # We use this 'clean_text' for the AI models.
        clean_text = emoji.demojize(request.text, delimiters=(" ", " "))
        
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
        
        rewrites = [
            RewriteOption(style="Empathetic (AI)", text=ai_rewrite_text),
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