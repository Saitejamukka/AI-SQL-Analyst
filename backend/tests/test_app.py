from starlette.testclient import TestClient
from app.main import app
from app.services.sample_db_seed import seed_sample_database
from app.services.sql_guardrails import SQLGuardrails

# Ensure sample database is seeded for tests
seed_sample_database()
client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["app"] == "AI SQL Analyst"

def test_guardrails_select_pass():
    res = SQLGuardrails.validate("SELECT * FROM customers LIMIT 5;")
    assert res["is_valid"] is True

def test_guardrails_drop_block():
    res = SQLGuardrails.validate("DROP TABLE customers;")
    assert res["is_valid"] is False

def test_guardrails_delete_block():
    res = SQLGuardrails.validate("DELETE FROM orders WHERE id = 1;")
    assert res["is_valid"] is False

def test_schema_endpoint():
    response = client.get("/api/schema/")
    assert response.status_code == 200
    data = response.json()
    print("DEBUG SCHEMA TEST DATA:", data)
    assert "tables" in data
    assert data["total_tables"] > 0

def test_nl_query_execution():
    payload = {"question": "Show top 5 customers by total spending"}
    response = client.post("/api/query/generate-and-execute", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "generated_sql" in data
    assert len(data["rows"]) > 0

def test_raw_sql_execution():
    payload = {"sql": "SELECT name, price FROM products LIMIT 3;", "question": "Test Direct SQL"}
    response = client.post("/api/query/execute-raw", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["rows"]) == 3
