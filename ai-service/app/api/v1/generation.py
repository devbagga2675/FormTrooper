# app/api/v1/generation.py
from fastapi import APIRouter, HTTPException
from app.schemas.generation import GenerationRequest, GenerationResponse
from app.services import llm_service

router = APIRouter()

@router.post("/generate", response_model=GenerationResponse)
async def generate_form(request: GenerationRequest):
    """
    Accepts structured details and returns an AI-generated form structure.
    """
    try:
        generated_form_structure = await llm_service.generate_form_from_prompt(
            request=request
        )
        return GenerationResponse(form_data=generated_form_structure)
    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))