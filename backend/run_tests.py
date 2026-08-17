from tests.test_app import (
    test_root, test_guardrails_select_pass, test_guardrails_drop_block,
    test_guardrails_delete_block, test_schema_endpoint,
    test_nl_query_execution, test_raw_sql_execution
)

def run():
    print("Running AI SQL Analyst Backend Tests...")
    test_root()
    print("[PASS] test_root passed")
    test_guardrails_select_pass()
    print("[PASS] test_guardrails_select_pass passed")
    test_guardrails_drop_block()
    print("[PASS] test_guardrails_drop_block passed")
    test_guardrails_delete_block()
    print("[PASS] test_guardrails_delete_block passed")
    test_schema_endpoint()
    print("[PASS] test_schema_endpoint passed")
    test_nl_query_execution()
    print("[PASS] test_nl_query_execution passed")
    test_raw_sql_execution()
    print("[PASS] test_raw_sql_execution passed")
    print("\nALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run()
