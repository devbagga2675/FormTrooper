# app/schemas/generation.py
from pydantic import BaseModel

class GenerationRequest(BaseModel):
    context: str
    # Example: "A 5 question quiz about the solar system for 5th graders"

class GenerationResponse(BaseModel):
    # This will eventually hold the structured JSON from the AI
    # For now, it can be a simple structure
    form_data: dict
