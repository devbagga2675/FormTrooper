from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    JINA_API_KEY: str
    PINECONE_API_KEY: str     # <-- Add
    PINECONE_ENVIRONMENT: str

    class Config:
        env_file = ".env"

settings = Settings()