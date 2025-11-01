from fastapi import FastAPI
from pydantic import BaseModel
from utils.pdf_parser import extract_text_from_pdf
import os
import uvicorn

class ResumeRequest(BaseModel):
    file_path :str
    


app = FastAPI()

@app.post("/api/analyze_resume")
async def analyze_resume(request: ResumeRequest):
    text = extract_text_from_pdf(request.file_path)
    print(request.file_path)
    return {"message": "Resume processed successfully",
            "data" : text}

if __name__ == "__main__":      
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
