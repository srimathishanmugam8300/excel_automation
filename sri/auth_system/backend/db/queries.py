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
        # Explicitly set is_first_login and is_active to 1 as per requirements
        conn.execute('''
            INSERT INTO users (user_id, email, hashed_password, created_by_admin, is_first_login, is_active)
            VALUES (?, ?, ?, ?, 1, 1)
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

def update_user_for_reset(user_id, new_hashed_password):
    conn = get_db_connection()
    conn.execute('''
        UPDATE users 
        SET hashed_password = ?, is_first_login = 0, is_active = 1
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
    # Ensure only one active reset token per user by invalidating old ones
    conn.execute('UPDATE password_resets SET is_used = 1 WHERE user_id = ?', (user_id,))
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

def invalidate_all_reset_tokens(user_id):
    conn = get_db_connection()
    conn.execute('UPDATE password_resets SET is_used = 1 WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()

# --- Activity Logs ---
def get_activity_logs():
    conn = get_db_connection()
    logs = conn.execute('SELECT * FROM activity_logs ORDER BY timestamp DESC').fetchall()
    conn.close()
    return logs

def create_activity_log(user_id, action, detail, type):
    conn = get_db_connection()
    conn.execute('INSERT INTO activity_logs (user_id, action, detail, type) VALUES (?, ?, ?, ?)',
                 (user_id, action, detail, type))
    conn.commit()
    conn.close()

def update_activity_log(log_id, user_id, action, detail, type):
    conn = get_db_connection()
    conn.execute('UPDATE activity_logs SET user_id=?, action=?, detail=?, type=? WHERE id=?',
                 (user_id, action, detail, type, log_id))
    conn.commit()
    conn.close()

def delete_activity_log(log_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM activity_logs WHERE id=?', (log_id,))
    conn.commit()
    conn.close()

# --- Trigger Rules ---
def get_trigger_rules():
    conn = get_db_connection()
    rules = conn.execute('SELECT * FROM trigger_rules').fetchall()
    conn.close()
    return rules

def create_trigger_rule(rule_name, rule_type, project_name, start_date, deadline, frequency, status):
    conn = get_db_connection()
    conn.execute('''INSERT INTO trigger_rules (rule_name, rule_type, project_name, start_date, deadline, frequency, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?)''',
                 (rule_name, rule_type, project_name, start_date, deadline, frequency, status))
    conn.commit()
    conn.close()

def update_trigger_rule(rule_id, rule_name, rule_type, project_name, start_date, deadline, frequency, status):
    conn = get_db_connection()
    conn.execute('''UPDATE trigger_rules SET rule_name=?, rule_type=?, project_name=?, start_date=?, deadline=?, frequency=?, status=?
                    WHERE id=?''',
                 (rule_name, rule_type, project_name, start_date, deadline, frequency, status, rule_id))
    conn.commit()
    conn.close()

def delete_trigger_rule(rule_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM trigger_rules WHERE id=?', (rule_id,))
    conn.commit()
    conn.close()

# --- Memos ---
def get_memos():
    conn = get_db_connection()
    memos = conn.execute('SELECT * FROM memos').fetchall()
    conn.close()
    return memos

def create_memo(user_id, reason, content, date_issued, escalation_level, status):
    conn = get_db_connection()
    conn.execute('''INSERT INTO memos (user_id, reason, content, date_issued, escalation_level, status)
                    VALUES (?, ?, ?, ?, ?, ?)''',
                 (user_id, reason, content, date_issued, escalation_level, status))
    conn.commit()
    conn.close()

def update_memo(memo_id, user_id, reason, content, date_issued, escalation_level, status):
    conn = get_db_connection()
    conn.execute('''UPDATE memos SET user_id=?, reason=?, content=?, date_issued=?, escalation_level=?, status=?
                    WHERE id=?''',
                 (user_id, reason, content, date_issued, escalation_level, status, memo_id))
    conn.commit()
    conn.close()

def delete_memo(memo_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM memos WHERE id=?', (memo_id,))
    conn.commit()
    conn.close()

# --- Compliance Tasks ---
def get_compliance_tasks():
    conn = get_db_connection()
    tasks = conn.execute('SELECT * FROM compliance_tasks').fetchall()
    result = []
    for task in tasks:
        t = dict(task)
        users = conn.execute('SELECT * FROM compliance_task_users WHERE task_id=?', (t['id'],)).fetchall()
        t['users'] = [dict(u) for u in users]
        result.append(t)
    conn.close()
    return result

def create_compliance_task(task_name, deadline, completed, total_progress, users):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO compliance_tasks (task_name, deadline, completed, total_progress) VALUES (?, ?, ?, ?)',
                   (task_name, deadline, completed, total_progress))
    task_id = cursor.lastrowid
    for user in users:
        cursor.execute('INSERT INTO compliance_task_users (task_id, user_id, progress) VALUES (?, ?, ?)',
                       (task_id, user['user_id'], user['progress']))
    conn.commit()
    conn.close()

def update_compliance_task(task_id, task_name, deadline, completed, total_progress, users):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE compliance_tasks SET task_name=?, deadline=?, completed=?, total_progress=? WHERE id=?',
                   (task_name, deadline, completed, total_progress, task_id))
    
    # Update users: delete all and recreate (simplest for MVP)
    cursor.execute('DELETE FROM compliance_task_users WHERE task_id=?', (task_id,))
    for user in users:
        cursor.execute('INSERT INTO compliance_task_users (task_id, user_id, progress) VALUES (?, ?, ?)',
                       (task_id, user['user_id'], user['progress']))
    conn.commit()
    conn.close()

def delete_compliance_task(task_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM compliance_tasks WHERE id=?', (task_id,))
    conn.execute('DELETE FROM compliance_task_users WHERE task_id=?', (task_id,))
    conn.commit()
    conn.close()
