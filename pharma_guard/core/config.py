import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PharmaGuard"
    API_V1_STR: str = "/api/v1"
    
    # LLM API Keys (loaded from env)
    # Defaulting to a placeholder or env var
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "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")

    class Config:
        case_sensitive = True

settings = Settings()
