import os
import sqlite3
from passlib.hash import bcrypt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "db", "auth_system.db")

DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin123"


def ensure_admin_exists():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Ensure admins table exists
    cur.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            is_first_login INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # Check if admin already exists
    cur.execute("SELECT COUNT(*) FROM admins;")
    (admin_count,) = cur.fetchone()

    if admin_count > 0:
        print("Admin account already exists — skipping seed.")
        conn.close()
        return

    # Create default admin
    password_hash = bcrypt.using(rounds=12).hash(
        DEFAULT_ADMIN_PASSWORD[:72]  # enforce safe length
    )
    cur.execute(
        "INSERT INTO admins (username, password_hash, is_first_login) VALUES (?, ?, 1)",
        (DEFAULT_ADMIN_USERNAME, password_hash)
    )

    conn.commit()
    conn.close()

    print("Created default admin account")
    print(f"Username: {DEFAULT_ADMIN_USERNAME}")
    print(f"Password: {DEFAULT_ADMIN_PASSWORD}  (will require change on first login)")


if __name__ == "__main__":
    ensure_admin_exists()
