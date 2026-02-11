from fastapi import FastAPI
from pydantic import BaseModel
from utils.pdf_parser import extract_text_from_pdf
from utils.skill_extractor import extract_skills
import os
import uvicorn

class ResumeRequest(BaseModel):
    file_path :str
    


app = FastAPI()

@app.post("/api/analyze_resume")
async def analyze_resume(request: ResumeRequest):
    text = extract_text_from_pdf(request.file_path)
    print(request.file_path)
    skill_json= extract_skills(text)

    return {"data" : skill_json}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
