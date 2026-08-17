from fastapi import APIRouter, HTTPException
from app.services.system_storage import system_storage
from app.services.db_inspector import DatabaseInspector

router = APIRouter()

@router.get("/")
def get_schema():
    active_conn = system_storage.get_active_connection()
    if not active_conn:
        raise HTTPException(status_code=404, detail="No active database connection found.")
    
    inspector = DatabaseInspector(
        db_type=active_conn["db_type"],
        connection_string=active_conn["connection_string"]
    )
    
    try:
        schema = inspector.discover_schema()
        schema["active_connection"] = active_conn
        return schema
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to inspect database schema: {str(e)}")
