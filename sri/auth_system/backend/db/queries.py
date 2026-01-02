from .connection import get_db_connection
from datetime import datetime

# --- Admin Queries ---
def get_admin_by_username(username):
    conn = get_db_connection()
    admin = conn.execute('SELECT * FROM admins WHERE username = ?', (username,)).fetchone()
    conn.close()
    return admin

def create_admin(username, hashed_password):
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO admins (username, hashed_password) VALUES (?, ?)',
                     (username, hashed_password))
        conn.commit()
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        conn.close()

# --- User Queries ---
def create_user(user_id, email, hashed_password, created_by_admin):
    conn = get_db_connection()
    try:
        conn.execute('''
            INSERT INTO users (user_id, email, hashed_password, created_by_admin)
            VALUES (?, ?, ?, ?)
        ''', (user_id, email, hashed_password, created_by_admin))
        conn.commit()
        return True
    except Exception as e:
        print(f"Error creating user: {e}")
        return False
    finally:
        conn.close()

def get_user_by_id(user_id):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE user_id = ?', (user_id,)).fetchone()
    conn.close()
    return user

def update_user_password(user_id, new_hashed_password):
    conn = get_db_connection()
    conn.execute('''
        UPDATE users 
        SET hashed_password = ?, is_first_login = 0 
        WHERE user_id = ?
    ''', (new_hashed_password, user_id))
    conn.commit()
    conn.close()

def admin_reset_user_password(user_id, new_hashed_password):
    conn = get_db_connection()
    conn.execute('''
        UPDATE users 
        SET hashed_password = ?, is_first_login = 1 
        WHERE user_id = ?
    ''', (new_hashed_password, user_id))
    conn.commit()
    conn.close()

def get_all_users():
    conn = get_db_connection()
    users = conn.execute('SELECT user_id, email, is_first_login, is_active, created_by_admin, created_at FROM users').fetchall()
    conn.close()
    return users

# --- Password Reset Queries ---
def create_reset_token(token, user_id, expiry):
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO password_resets (token, user_id, expiry)
        VALUES (?, ?, ?)
    ''', (token, user_id, expiry))
    conn.commit()
    conn.close()

def get_reset_token(token):
    conn = get_db_connection()
    reset_entry = conn.execute('SELECT * FROM password_resets WHERE token = ?', (token,)).fetchone()
    conn.close()
    return reset_entry

def mark_token_used(token):
    conn = get_db_connection()
    conn.execute('UPDATE password_resets SET is_used = 1 WHERE token = ?', (token,))
    conn.commit()
    conn.close()
