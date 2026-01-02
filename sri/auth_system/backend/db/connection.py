import sqlite3
import os

# DB is in the parent directory of 'db' folder (i.e., backend root)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "auth.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    with open(SCHEMA_PATH, 'r') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
