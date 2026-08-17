from fastapi import APIRouter
from app.services.system_storage import system_storage

router = APIRouter()

@router.get("/")
def get_query_history(limit: int = 50):
    return system_storage.get_query_history(limit=limit)
