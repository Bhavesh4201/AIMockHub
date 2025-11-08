from fastapi import FastAPI 
import uvicorn
import os
import google.generativeai as genai  # type: ignore
from dotenv import load_dotenv

load_dotenv()


app = FastAPI()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("api key not found")


genai.configure(api_key=api_key)


prompt = "expla what is langChan and why it use ,explain it in 100 words"

@app.post("/api/question_generator")
async def generat_question():
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        if response and response.text:
            gemini_output = response.text.strip()
            
            # Remove markdown code blocks if present
            if gemini_output.startswith('```json'):
                gemini_output = gemini_output[7:]
            elif gemini_output.startswith('```'):
                gemini_output = gemini_output[3:]
            if gemini_output.endswith('```'):
                gemini_output = gemini_output[:-3]
            gemini_output = gemini_output.strip()
            
    except Exception as e:
        print("Gemini raspon fail" , e)

    return gemini_output



if __name__ ==  "__main__":
    uvicorn.run("main:app", host="0.0.0.0",port=8001 ,reload=True)