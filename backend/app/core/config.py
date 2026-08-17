import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AI SQL Analyst"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Path for sample SQLite database
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    SAMPLE_DB_PATH: str = os.path.join(BASE_DIR, "sample_ecommerce.db")
    SYSTEM_DB_PATH: str = os.path.join(BASE_DIR, "system_storage.db")

settings = Settings()
