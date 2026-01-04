import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Empathy Engine"
    API_V1_STR: str = "/api/v1"
    
    # Path where VectorDB will store data
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    
    class Config:
        case_sensitive = True

settings = Settings()