import re
from typing import Dict, Any

class SQLGuardrails:
    DANGEROUS_KEYWORDS = [
        r"\bINSERT\b", r"\bUPDATE\b", r"\bDELETE\b", r"\bDROP\b",
        r"\bALTER\b", r"\bTRUNCATE\b", r"\bCREATE\b", r"\bRENAME\b",
        r"\bGRANT\b", r"\bREVOKE\b", r"\bEXEC\b", r"\bEXECUTE\b",
        r"\bATTACH\b", r"\bDETACH\b", r"\bREINDEX\b", r"\bVACUUM\b",
        r"\bMERGE\b", r"\bUPSERT\b"
    ]

    @classmethod
    def validate(cls, sql: str) -> Dict[str, Any]:
        """
        Validates whether an SQL string is safe and strictly read-only SELECT query.
        """
        if not sql or not sql.strip():
            return {
                "is_valid": False,
                "reason": "SQL query is empty."
            }

        clean_sql = sql.strip()

        # Remove SQL comments (-- comment or /* comment */)
        clean_sql_no_comments = re.sub(r"--.*$", "", clean_sql, flags=re.MULTILINE)
        clean_sql_no_comments = re.sub(r"/\*.*?\*/", "", clean_sql_no_comments, flags=re.DOTALL).strip()

        # Check multi-statement execution (semicolons separating queries)
        statements = [s.strip() for s in clean_sql_no_comments.split(";") if s.strip()]
        if len(statements) > 1:
            return {
                "is_valid": False,
                "reason": "Multiple SQL statements detected. Only a single SELECT query is permitted per request."
            }

        first_stmt = statements[0] if statements else clean_sql_no_comments

        # Ensure query starts with SELECT or WITH (for CTEs)
        if not (first_stmt.upper().startswith("SELECT") or first_stmt.upper().startswith("WITH")):
            return {
                "is_valid": False,
                "reason": "Security Violation: Non-read-only operation detected. Only SELECT statements are permitted."
            }

        # Scan for dangerous keywords
        for pattern in cls.DANGEROUS_KEYWORDS:
            if re.search(pattern, clean_sql_no_comments, re.IGNORECASE):
                matched_kw = re.search(pattern, clean_sql_no_comments, re.IGNORECASE).group(0)
                return {
                    "is_valid": False,
                    "reason": f"Security Violation: Forbidden keyword '{matched_kw}' detected. Only read-only SELECT operations are allowed."
                }

        return {
            "is_valid": True,
            "reason": "Query passed read-only safety guardrails.",
            "clean_sql": first_stmt
        }
