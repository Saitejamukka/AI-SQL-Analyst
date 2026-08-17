from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from app.services.system_storage import system_storage
from app.services.db_inspector import DatabaseInspector
from app.services.sql_guardrails import SQLGuardrails
from app.services.ai_orchestrator import AIOrchestrator

router = APIRouter()

class NLQueryRequest(BaseModel):
    question: str
    conversation_history: Optional[List[Dict[str, Any]]] = None

class RawSQLRequest(BaseModel):
    sql: str
    question: Optional[str] = "Manual SQL Query"

class AutoFixRequest(BaseModel):
    sql: str
    error: str

@router.post("/generate-and-execute")
def generate_and_execute_query(payload: NLQueryRequest):
    active_conn = system_storage.get_active_connection()
    if not active_conn:
        raise HTTPException(status_code=404, detail="No active database connection found.")

    inspector = DatabaseInspector(
        db_type=active_conn["db_type"],
        connection_string=active_conn["connection_string"]
    )
    schema = inspector.discover_schema()

    orchestrator = AIOrchestrator()
    
    # 1. Generate SQL from question + schema context
    generated_sql = orchestrator.generate_sql(
        question=payload.question,
        schema=schema,
        conversation_history=payload.conversation_history
    )

    # 2. Validate generated SQL through strict guardrails
    validation = SQLGuardrails.validate(generated_sql)
    if not validation["is_valid"]:
        system_storage.log_query(
            question=payload.question,
            sql=generated_sql,
            status="BLOCKED",
            exec_time=0.0,
            count=0,
            error=validation["reason"]
        )
        raise HTTPException(status_code=400, detail=f"Guardrail Block: {validation['reason']}")

    # 3. Execute validated safe SELECT query
    exec_res = inspector.execute_query(generated_sql)
    if not exec_res["success"]:
        system_storage.log_query(
            question=payload.question,
            sql=generated_sql,
            status="ERROR",
            exec_time=exec_res.get("execution_time_ms", 0),
            count=0,
            error=exec_res.get("error")
        )
        return {
            "success": False,
            "question": payload.question,
            "generated_sql": generated_sql,
            "error": exec_res.get("error"),
            "can_autofix": True
        }

    # 4. Generate Business Result Explanation & Visualization Recommendation
    explanation = orchestrator.explain_results(
        question=payload.question,
        sql=generated_sql,
        rows=exec_res["rows"]
    )

    visualization = orchestrator.recommend_visualization(
        sql=generated_sql,
        rows=exec_res["rows"]
    )

    # Log successful execution in audit trail
    system_storage.log_query(
        question=payload.question,
        sql=generated_sql,
        status="SUCCESS",
        exec_time=exec_res["execution_time_ms"],
        count=exec_res["record_count"]
    )

    return {
        "success": True,
        "question": payload.question,
        "generated_sql": generated_sql,
        "columns": exec_res["columns"],
        "rows": exec_res["rows"],
        "record_count": exec_res["record_count"],
        "execution_time_ms": exec_res["execution_time_ms"],
        "explanation": explanation,
        "visualization": visualization,
        "guardrail_status": "PASSED (Read-Only SELECT)"
    }

@router.post("/execute-raw")
def execute_raw_sql(payload: RawSQLRequest):
    active_conn = system_storage.get_active_connection()
    inspector = DatabaseInspector(
        db_type=active_conn["db_type"],
        connection_string=active_conn["connection_string"]
    )

    # Validate SQL Guardrails
    validation = SQLGuardrails.validate(payload.sql)
    if not validation["is_valid"]:
        system_storage.log_query(
            question=payload.question,
            sql=payload.sql,
            status="BLOCKED",
            exec_time=0,
            count=0,
            error=validation["reason"]
        )
        raise HTTPException(status_code=400, detail=f"Guardrail Block: {validation['reason']}")

    exec_res = inspector.execute_query(payload.sql)
    if not exec_res["success"]:
        system_storage.log_query(
            question=payload.question,
            sql=payload.sql,
            status="ERROR",
            exec_time=exec_res.get("execution_time_ms", 0),
            count=0,
            error=exec_res.get("error")
        )
        raise HTTPException(status_code=400, detail=exec_res.get("error"))

    orchestrator = AIOrchestrator()
    explanation = orchestrator.explain_results(
        question=payload.question,
        sql=payload.sql,
        rows=exec_res["rows"]
    )
    visualization = orchestrator.recommend_visualization(
        sql=payload.sql,
        rows=exec_res["rows"]
    )

    system_storage.log_query(
        question=payload.question,
        sql=payload.sql,
        status="SUCCESS",
        exec_time=exec_res["execution_time_ms"],
        count=exec_res["record_count"]
    )

    return {
        "success": True,
        "question": payload.question,
        "generated_sql": payload.sql,
        "columns": exec_res["columns"],
        "rows": exec_res["rows"],
        "record_count": exec_res["record_count"],
        "execution_time_ms": exec_res["execution_time_ms"],
        "explanation": explanation,
        "visualization": visualization,
        "guardrail_status": "PASSED (Read-Only SELECT)"
    }

@router.post("/autofix")
def autofix_sql_endpoint(payload: AutoFixRequest):
    active_conn = system_storage.get_active_connection()
    inspector = DatabaseInspector(
        db_type=active_conn["db_type"],
        connection_string=active_conn["connection_string"]
    )
    schema = inspector.discover_schema()

    orchestrator = AIOrchestrator()
    res = orchestrator.autofix_sql(
        original_sql=payload.sql,
        error_message=payload.error,
        schema=schema
    )
    return res
