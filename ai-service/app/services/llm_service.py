# app/services/llm_service.py
import google.generativeai as genai
from app.core.config import settings

# Configure the SDK
genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

async def generate_form_from_prompt(prompt: str) -> dict:
    """
    Generates form structure from a text prompt using the Gemini API.
    """
    # For now, we return a mocked response.
    # Later, we will implement the actual API call here.
    print(f"Received prompt: {prompt}")
    mocked_response = {
        "title": "Mock Solar System Quiz",
        "questions": [
            {
                "question_text": "Which planet is known as the Red Planet?",
                "question_type": "multiple_choice",
                "options": ["Earth", "Mars", "Jupiter", "Venus"]
            }
        ]
    }
    # To use the actual API (uncomment later):
    # response = await model.generate_content_async(prompt)
    # return {"text": response.text}

    return mocked_response
