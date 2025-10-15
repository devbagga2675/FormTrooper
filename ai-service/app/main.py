# app/main.py
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.api.v1 import generation, analysis 
from fastapi.exceptions import RequestValidationError

app = FastAPI(title="FormTrooper AI service")
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    This handler catches Pydantic validation errors and logs the detailed
    error messages to the console before returning a 422 response.
    """
    # Log the full, detailed error from Pydantic
    logging.error(f"--- VALIDATION ERROR ---")
    logging.error(exc.errors())
    
    return JSONResponse(
        status_code=422,
        content={"detail": "Unprocessable Entity", "errors": exc.errors()},
    )
# Include the router from the generation module
app.include_router(generation.router, prefix="/api/v1", tags=["Generation"])
app.include_router(analysis.router, prefix="/api/v1/analyze", tags=["Analysis"])

@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "AI Service is up and running!"}
