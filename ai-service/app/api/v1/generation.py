# app/api/v1/generation.py
from fastapi import APIRouter
from app.schemas.generation import GenerationRequest, GenerationResponse
from app.services import llm_service

router = APIRouter()

@router.post("/generate", response_model=GenerationResponse)
async def generate_form(request: GenerationRequest):
    """
    Accepts a context prompt and returns an AI-generated form structure.
    """
    generated_data = await llm_service.generate_form_from_prompt(request.context)
    return GenerationResponse(form_data=generated_data)
