from fastapi import FastAPI
import uvicorn
import os
import google.generativeai as genai  # type: ignore
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import Optional
from utils.feedback_prompt import create_feedback_prompt
import json
import re

load_dotenv()

app = FastAPI()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables")

if api_key:
    genai.configure(api_key=api_key)

class TextRequest(BaseModel):
    text: str
    emotion_data: Optional[dict] = None

@app.post("/api/feedbacke_generator")
async def generator_feedback(request: TextRequest):
    """
    Generate feedback for a user's interview answer.
    
    Args:
        request: TextRequest containing the user's answer text
        
    Returns:
        dict: Feedback containing strengths, improvements, and score
    """
    try:
        if not request.text or not request.text.strip():
            return {
                "error": "Text answer is required",
                "success": False
            }
        
       
        prompt = create_feedback_prompt(request.text, request.emotion_data)
        
        if not api_key:
            return {
                "success": True,
                "data": {
                    "feedback": "This is a sample feedback. Please configure GEMINI_API_KEY for AI-generated feedback.",
                    "strengths": [
                        "Good structure in your answer",
                        "Relevant examples provided"
                    ],
                    "improvements": [
                        "Could be more detailed",
                        "Consider adding more technical depth"
                    ],
                    "score": 75
                }
            }
        
      
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return {
                "error": "Empty response from LLM",
                "success": False
            }
        
        raw = response.text.strip()
        
       
        raw = re.sub(r"```json|```", "", raw).strip()
        
       
        try:
            feedback_data = json.loads(raw)
        except json.JSONDecodeError:
           
            feedback_data = {
                "feedback": raw,
                "strengths": [],
                "improvements": [],
                "score": None
            }
        
        result = {
            "success": True,
            "data": {
                "feedback": feedback_data.get("feedback", raw),
                "strengths": feedback_data.get("strengths", []),
                "improvements": feedback_data.get("improvements", []),
                "emotion_improvements": feedback_data.get("emotion_improvements", []),
                "score": feedback_data.get("score")
            }
        }
        
        return result
        
    except Exception as e:
        print(f"Error generating feedback: {e}")
        return {
            "error": str(e),
            "success": False
        }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "feedback_generator"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)
