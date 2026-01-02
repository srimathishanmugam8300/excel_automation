import os
import sys
import sqlite3

# Add current directory to sys.path to allow imports
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from services import hashing

DB_PATH = os.path.join(BASE_DIR, "db", "auth_system.db")

DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin123"

def ensure_admin_exists():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
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
    cur.execute("SELECT * FROM admins WHERE username = ?", (DEFAULT_ADMIN_USERNAME,))
    admin = cur.fetchone()

    if admin:
        # Verify password
        try:
            if not hashing.verify_password(DEFAULT_ADMIN_PASSWORD, admin['password_hash']):
                print("Admin password hash mismatch. Updating to default...")
                new_hash = hashing.get_password_hash(DEFAULT_ADMIN_PASSWORD)
                cur.execute("UPDATE admins SET password_hash = ?, is_first_login = 1 WHERE username = ?", 
                            (new_hash, DEFAULT_ADMIN_USERNAME))
                conn.commit()
                print("Admin password reset to default.")
            else:
                print("Admin account exists and password is valid.")
        except Exception as e:
            print(f"Error verifying password (likely legacy hash format): {e}")
            print("Updating to new hash format...")
            new_hash = hashing.get_password_hash(DEFAULT_ADMIN_PASSWORD)
            cur.execute("UPDATE admins SET password_hash = ?, is_first_login = 1 WHERE username = ?", 
                        (new_hash, DEFAULT_ADMIN_USERNAME))
            conn.commit()
            print("Admin password reset to default.")
            
    else:
        # Create default admin
        print("Creating default admin account...")
        password_hash = hashing.get_password_hash(DEFAULT_ADMIN_PASSWORD)
        cur.execute(
            "INSERT INTO admins (username, password_hash, is_first_login) VALUES (?, ?, 1)",
            (DEFAULT_ADMIN_USERNAME, password_hash)
        )
        conn.commit()
        print("Created default admin account")
        print(f"Username: {DEFAULT_ADMIN_USERNAME}")
        print(f"Password: {DEFAULT_ADMIN_PASSWORD}  (will require change on first login)")

    conn.close()

if __name__ == "__main__":
    ensure_admin_exists()
