import os
import sqlite3
from typing import Dict, List, Any, Optional

try:
    import psycopg2
except ImportError:
    psycopg2 = None

class DatabaseInspector:
    def __init__(self, db_type: str = "sqlite", connection_string: Optional[str] = None):
        """
        db_type: 'sqlite' or 'postgresql'
        connection_string: path to sqlite file OR postgresql connection URI
        """
        self.db_type = db_type.lower()
        self.connection_string = connection_string

    def get_connection(self):
        if self.db_type == "sqlite":
            from app.core.config import settings
            from app.services.sample_db_seed import seed_sample_database
            if not self.connection_string or not os.path.exists(self.connection_string) or os.path.getsize(self.connection_string) == 0:
                self.connection_string = seed_sample_database(self.connection_string)
            return sqlite3.connect(self.connection_string)
        elif self.db_type == "postgresql":
            if not psycopg2:
                raise ValueError("psycopg2 package is not installed. PostgreSQL connections require psycopg2.")
            return psycopg2.connect(self.connection_string)
        else:
            raise ValueError(f"Unsupported database type: {self.db_type}")

    def test_connection(self) -> Dict[str, Any]:
        try:
            conn = self.get_connection()
            cursor = conn.cursor()
            if self.db_type == "sqlite":
                cursor.execute("SELECT sqlite_version();")
                ver = cursor.fetchone()[0]
            else:
                cursor.execute("SELECT version();")
                ver = cursor.fetchone()[0]
            conn.close()
            return {
                "success": True,
                "message": f"Successfully connected to {self.db_type.upper()} (Version: {ver})",
                "version": ver
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Connection failed: {str(e)}"
            }

    def discover_schema(self) -> Dict[str, Any]:
        """
        Returns table list, column schemas, primary keys, foreign keys, and row counts.
        """
        conn = self.get_connection()
        cursor = conn.cursor()

        tables = []
        relationships = []

        if self.db_type == "sqlite":
            # List tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            table_names = [row[0] for row in cursor.fetchall()]

            for t_name in table_names:
                # Row count
                cursor.execute(f"SELECT COUNT(*) FROM `{t_name}`")
                row_count = cursor.fetchone()[0]

                # Columns
                cursor.execute(f"PRAGMA table_info(`{t_name}`)")
                col_info = cursor.fetchall()
                # cid, name, type, notnull, dflt_value, pk
                columns = []
                for col in col_info:
                    columns.append({
                        "name": col[1],
                        "type": col[2],
                        "nullable": not bool(col[3]),
                        "primary_key": bool(col[5])
                    })

                # Foreign keys
                cursor.execute(f"PRAGMA foreign_key_list(`{t_name}`)")
                fk_info = cursor.fetchall()
                # id, seq, table, from, to, on_update, on_delete, match
                for fk in fk_info:
                    relationships.append({
                        "from_table": t_name,
                        "from_column": fk[3],
                        "to_table": fk[2],
                        "to_column": fk[4]
                    })

                # Sample data (top 3 rows)
                cursor.execute(f"SELECT * FROM `{t_name}` LIMIT 3")
                raw_samples = cursor.fetchall()
                sample_rows = []
                for sr in raw_samples:
                    sample_rows.append(dict(zip([c["name"] for c in columns], sr)))

                tables.append({
                    "table_name": t_name,
                    "row_count": row_count,
                    "columns": columns,
                    "sample_data": sample_rows
                })

        elif self.db_type == "postgresql":
            # PostgreSQL schema extraction
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
            """)
            table_names = [row[0] for row in cursor.fetchall()]

            for t_name in table_names:
                # Row count
                cursor.execute(f"SELECT COUNT(*) FROM \"{t_name}\"")
                row_count = cursor.fetchone()[0]

                cursor.execute("""
                    SELECT column_name, data_type, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = %s;
                """, (t_name,))
                col_info = cursor.fetchall()
                columns = [{
                    "name": col[0],
                    "type": col[1],
                    "nullable": col[2] == 'YES',
                    "primary_key": False
                } for col in col_info]

                tables.append({
                    "table_name": t_name,
                    "row_count": row_count,
                    "columns": columns,
                    "sample_data": []
                })

        conn.close()

        return {
            "database_type": self.db_type,
            "total_tables": len(tables),
            "tables": tables,
            "relationships": relationships
        }

    def execute_query(self, sql: str) -> Dict[str, Any]:
        """
        Executes raw read-only SQL query and returns column names, rows, execution time, and record count.
        """
        import time
        start_time = time.time()

        conn = self.get_connection()
        cursor = conn.cursor()

        try:
            cursor.execute(sql)
            execution_time_ms = round((time.time() - start_time) * 1000, 2)

            if cursor.description:
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                
                # Format rows into dict list
                data = []
                for row in rows:
                    row_dict = {}
                    for idx, col in enumerate(columns):
                        val = row[idx]
                        if isinstance(val, (bytes, bytearray)):
                            val = "<binary>"
                        row_dict[col] = val
                    data.append(row_dict)

                conn.close()
                return {
                    "success": True,
                    "columns": columns,
                    "rows": data,
                    "record_count": len(data),
                    "execution_time_ms": execution_time_ms
                }
            else:
                conn.close()
                return {
                    "success": True,
                    "columns": [],
                    "rows": [],
                    "record_count": 0,
                    "execution_time_ms": execution_time_ms,
                    "message": "Query executed successfully (no results returned)."
                }
        except Exception as e:
            conn.close()
            return {
                "success": False,
                "error": str(e),
                "execution_time_ms": round((time.time() - start_time) * 1000, 2)
            }
