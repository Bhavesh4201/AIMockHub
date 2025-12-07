import json
import re
from fastapi import FastAPI 
import uvicorn
import os
import google.generativeai as genai  # type: ignore
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List

load_dotenv()

app = FastAPI()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Warning: GEMINI_API_KEY not found in environment variables")

if api_key:
    genai.configure(api_key=api_key)

class SkillsRequest(BaseModel):
    skills: List[str]

def create_prompt(skills: List[str]) -> str:
    skills_str = ", ".join(skills)

    prompt = f"""
You are an expert technical interviewer.

Generate exactly 5 interview questions based on these skills:
{skills_str}

STRICT OUTPUT RULES:
- Output ONLY a valid JSON array.
- NO markdown.
- NO code blocks.
- NO backticks.
- NO explanations.
- NO text before or after the JSON.
- JSON must be directly parseable.

FORMAT (use exactly this structure):
[
  {{
    "question_id": 1,
    "question": "Question text",
    "difficulty": "Easy | Medium | Hard",
    "skill_area": "Skill being tested"
  }},
  {{
    "question_id": 2,
    "question": "Question text",
    "difficulty": "Easy | Medium | Hard",
    "skill_area": "Skill being tested"
  }}
]

CONTENT RULES:
- Generate exactly 5 questions total.
- Mix of difficulties: 1 Easy, 2-3 Medium, 1-2 Hard
- Each question must be scenario-based and practical.
- "skill_area" must match one of the provided skills.
- Questions should test real-world problem-solving abilities.

Return ONLY the JSON array.
"""
    return prompt

@app.post("/api/question_generator")
async def generat_question(request: SkillsRequest):
    """
    Generate interview questions based on user skills.
    
    Args:
        request: SkillsRequest containing list of skills
        
    Returns:
        list: Array of question objects
    """
    try:
        if not request.skills or len(request.skills) == 0:
            return {
                "error": "Skills list cannot be empty",
                "success": False
            }
        
        # Use AI if API key is available, otherwise use mock data
        if api_key:
            prompt = create_prompt(request.skills)
            
            # model = genai.GenerativeModel("gemini-2.5-flash")
            # response = model.generate_content(prompt)
            
            # if not response or not response.text:
            #     # Fallback to mock data if API fails
            #     print("Empty response from LLM, using mock data")
            #     return get_mock_questions()
            
            # raw = response.text.strip()
            
            # # Remove markdown fences
            # raw = re.sub(r"|```", "", raw).strip()
            
            # Try directly parsing first
            try:
                # result = json.loads(raw)
                # Ensure it's a list
                if isinstance(result, list):
                    return result
                elif isinstance(result, dict) and "questions" in result:
                    return result["questions"]
                else:
                    # Wrap single object in list
                    return [result]
            except json.JSONDecodeError:
                # Fallback to manual extraction
                pass
            
            # Extract all JSON objects
            objects = re.findall(r"\{[\s\S]*?\}", raw)
            
            if not objects:
                print("No JSON found in LLM response, using mock data")
                return get_mock_questions()
            
            # Convert to array
            json_text = "[" + ",".join(objects) + "]"
            result = json.loads(json_text)
            
            # Ensure it's a list
            if not isinstance(result, list):
                result = [result]
            
            return result
        else:
            # Use mock data if API key is not configured
            print("API key not configured, using mock data")
            return get_mock_questions()
        
    except Exception as e:
        print(f"Error generating questions: {e}")
        # Return mock data as fallback
        return get_mock_questions()

def get_mock_questions():
    """Return mock questions as fallback"""
    return [
        {
            "question_id": 1,
            "question": "You are tasked with building a web application that allows users to submit text prompts and receive AI-generated content (e.g., summaries, creative writing). Describe the architecture you would design, including how you would handle the frontend (user input, displaying results), the backend (processing requests, interacting with the Gemini API), and the communication between them. Detail the specific technologies you'd use for each layer and key considerations for error handling and asynchronous operations.",
            "difficulty": "Hard",
            "skill_area": "react, node.js, express.js, restful apis, gemini api, javascript"
        },
        {
            "question_id": 2,
            "question": "Imagine you're developing a React application with a complex dashboard that fetches data from multiple asynchronous API endpoints. Users are reporting slow loading times and an unresponsive UI during data retrieval. How would you identify the bottlenecks and what strategies, including state management techniques and asynchronous programming patterns, would you employ to optimize performance and improve the user experience?",
            "difficulty": "Medium",
            "skill_area": "react, javascript, asynchronous programming"
        },
        {
            "question_id": 3,
            "question": "Your team is working on a new feature for an existing Java web application. Three developers are working on different parts of the feature simultaneously. Describe a Git branching strategy you would implement to manage their concurrent work, integrate their changes, and prepare for a release. Outline the key Git commands and GitHub practices you would use to ensure a smooth workflow and avoid conflicts.",
            "difficulty": "Medium",
            "skill_area": "git, github, version control, java"
        },
        {
            "question_id": 4,
            "question": "You need to design a RESTful API for a new e-commerce service that manages products, orders, and users. Describe how you would structure the API endpoints, including HTTP methods, resource naming conventions, and status codes for common operations (e.g., retrieving a product, creating an order, updating a user). Explain how Express.js could be used to implement these routes and middleware for authentication.",
            "difficulty": "Medium",
            "skill_area": "node.js, express.js, restful apis, javascript"
        },
        {
            "question_id": 5,
            "question": "A user reports that a specific button in a web form is not appearing correctly on their screen – it's overlapping another element and its background color is wrong, even though the CSS file defines a correct background. You inspect the element in the browser developer tools and see conflicting styles. Describe your systematic approach to debug this issue, identifying potential causes in HTML structure, CSS specificity, and browser rendering, and how you would resolve it.",
            "difficulty": "Easy",
            "skill_area": "html, css, javascript"
        }
    ]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "question_generator"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)### Fixed `ai_services/src/question_generator/requirements.txt`:
