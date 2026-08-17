from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.core.security import create_access_token, get_password_hash, verify_password

router = APIRouter()

class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "Business Analyst"

class UserLogin(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(user_data: UserRegister):
    # Simulated auth register for demo/production system
    token = create_access_token(subject=user_data.username)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": user_data.username,
            "email": user_data.email,
            "role": user_data.role
        }
    }

@router.post("/login")
def login(credentials: UserLogin):
    token = create_access_token(subject=credentials.username)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": credentials.username,
            "email": f"{credentials.username}@analyst.ai",
            "role": "Lead Data Analyst"
        }
    }

@router.get("/me")
def get_current_user():
    return {
        "username": "demo_analyst",
        "email": "analyst@company.com",
        "role": "Business Analyst",
        "permissions": ["read_schema", "execute_sql", "export_data"]
    }
