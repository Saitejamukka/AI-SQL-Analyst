from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.system_storage import system_storage
from app.services.db_inspector import DatabaseInspector

router = APIRouter()

class ConnectionCreate(BaseModel):
    name: str
    db_type: str  # "sqlite" or "postgresql"
    connection_string: str
    set_active: Optional[bool] = True

class ConnectionTest(BaseModel):
    db_type: str
    connection_string: str

@router.get("/")
def get_connections():
    return system_storage.list_connections()

@router.post("/test")
def test_connection(data: ConnectionTest):
    inspector = DatabaseInspector(db_type=data.db_type, connection_string=data.connection_string)
    res = inspector.test_connection()
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@router.post("/")
def create_connection(data: ConnectionCreate):
    inspector = DatabaseInspector(db_type=data.db_type, connection_string=data.connection_string)
    test_res = inspector.test_connection()
    if not test_res["success"]:
        raise HTTPException(status_code=400, detail=f"Invalid connection credentials: {test_res['message']}")
    
    new_conn = system_storage.add_connection(
        name=data.name,
        db_type=data.db_type,
        connection_string=data.connection_string,
        set_active=data.set_active
    )
    return new_conn

@router.post("/{connection_id}/activate")
def activate_connection(connection_id: int):
    success = system_storage.set_active_connection(connection_id)
    if not success:
        raise HTTPException(status_code=404, detail="Connection not found")
    return {"message": f"Connection #{connection_id} is now active."}
