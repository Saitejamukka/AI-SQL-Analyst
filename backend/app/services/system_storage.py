import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from app.core.config import settings

class SystemStorage:
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = settings.SYSTEM_DB_PATH
        self.db_path = db_path
        self._init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()

        # Users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'Business Analyst',
            created_at DATETIME NOT NULL
        );
        """)

        # Database Connections table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS db_connections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            db_type TEXT NOT NULL,
            connection_string TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL
        );
        """)

        # Query History / Audit Log table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS query_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question TEXT,
            generated_sql TEXT NOT NULL,
            status TEXT NOT NULL,
            execution_time_ms REAL,
            record_count INTEGER,
            error_message TEXT,
            created_at DATETIME NOT NULL
        );
        """)

        conn.commit()

        # Seed default sample database connection if empty
        cursor.execute("SELECT COUNT(*) FROM db_connections;")
        if cursor.fetchone()[0] == 0:
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
                INSERT INTO db_connections (name, db_type, connection_string, is_active, created_at)
                VALUES (?, ?, ?, ?, ?)
            """, ("E-Commerce Store (Sample DB)", "sqlite", settings.SAMPLE_DB_PATH, 1, now_str))
            conn.commit()

        conn.close()

    def get_active_connection(self) -> Dict[str, Any]:
        conn = sqlite3.connect(settings.SYSTEM_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM db_connections WHERE is_active = 1 LIMIT 1;")
        row = cursor.fetchone()
        conn.close()
        if row:
            return dict(row)
        return {
            "id": 1,
            "name": "E-Commerce Store (Sample DB)",
            "db_type": "sqlite",
            "connection_string": settings.SAMPLE_DB_PATH,
            "is_active": 1
        }

    def add_connection(self, name: str, db_type: str, connection_string: str, set_active: bool = False) -> Dict[str, Any]:
        conn = self.get_connection()
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if set_active:
            cursor.execute("UPDATE db_connections SET is_active = 0;")

        cursor.execute("""
            INSERT INTO db_connections (name, db_type, connection_string, is_active, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (name, db_type, connection_string, 1 if set_active else 0, now_str))
        conn.commit()
        conn_id = cursor.lastrowid
        conn.close()
        return {"id": conn_id, "name": name, "db_type": db_type, "connection_string": connection_string, "is_active": set_active}

    def set_active_connection(self, connection_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE db_connections SET is_active = 0;")
        cursor.execute("UPDATE db_connections SET is_active = 1 WHERE id = ?;", (connection_id,))
        conn.commit()
        conn.close()
        return True

    def list_connections(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, db_type, connection_string, is_active, created_at FROM db_connections ORDER BY id ASC;")
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

    def log_query(self, question: str, sql: str, status: str, exec_time: float, count: int, error: Optional[str] = None):
        conn = self.get_connection()
        cursor = conn.cursor()
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("""
            INSERT INTO query_history (user_id, question, generated_sql, status, execution_time_ms, record_count, error_message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (1, question, sql, status, exec_time, count, error, now_str))
        conn.commit()
        conn.close()

    def get_query_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM query_history ORDER BY id DESC LIMIT ?;", (limit,))
        rows = cursor.fetchall()
        conn.close()
        return [dict(r) for r in rows]

system_storage = SystemStorage()
