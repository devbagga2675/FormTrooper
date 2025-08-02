# app/main.py
from fastapi import FastAPI
from app.api.v1 import generation

app = FastAPI(title="FormTrooper AI service")

# Include the router from the generation module
app.include_router(generation.router, prefix="/api/v1", tags=["Generation"])

@app.get("/", tags=["Health Check"])
async def root():
    return {"message": "AI Service is running!"}
