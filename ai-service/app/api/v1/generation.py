# app/api/v1/generation.py
import logging
from fastapi import APIRouter, HTTPException
from app.schemas.generation import GenerationRequest, GenerationResponse
from app.services import llm_service
from app.schemas.generation import RefinementRequest, RefinementResponse
from app.services.llm_service import refine_questions
from app.schemas.generation import DummyResponseRequest
from app.services.llm_service import generate_dummy_answers

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
    
    
@router.post("/refine", response_model=RefinementResponse)
async def refine_form_questions(request: RefinementRequest):
    try:
        refined_questions_list = await refine_questions(request)
        return RefinementResponse(refined_questions=refined_questions_list)
    except Exception as e:
        # ADD THIS LINE to log the full traceback to your terminal
        logging.exception("An error occurred in the /refine endpoint")
        raise HTTPException(status_code=500, detail=str(e))
    
    
@router.post("/generate-dummy-answers")
async def generate_dummy_answers_endpoint(request: DummyResponseRequest):
    try:
        answers = await generate_dummy_answers(request)
        return answers
    except Exception as e:
        # This will now log the full error traceback to your terminal
        logging.exception("An error occurred in the /generate-dummy-answers endpoint")
        raise HTTPException(status_code=500, detail=str(e))