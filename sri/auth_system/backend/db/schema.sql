CREATE TABLE IF NOT EXISTS admins (
    username TEXT PRIMARY KEY,
    hashed_password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT,
    hashed_password TEXT NOT NULL,
    is_first_login INTEGER DEFAULT 1, -- 1 for true, 0 for false
    is_active INTEGER DEFAULT 1,      -- 1 for true, 0 for false
    created_by_admin TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_admin) REFERENCES admins(username)
);

CREATE TABLE IF NOT EXISTS password_resets (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expiry TIMESTAMP NOT NULL,
    is_used INTEGER DEFAULT 0,        -- 1 for true, 0 for false
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    detail TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type TEXT -- 'update', 'login', 'admin', etc.
);

CREATE TABLE IF NOT EXISTS trigger_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    project_name TEXT,
    start_date TEXT,
    deadline TEXT,
    frequency TEXT,
    status TEXT DEFAULT 'Active' -- 'Active', 'Inactive'
);

CREATE TABLE IF NOT EXISTS memos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    reason TEXT,
    content TEXT,
    date_issued TEXT,
    escalation_level TEXT,
    status TEXT DEFAULT 'Open' -- 'Open', 'Closed'
);

CREATE TABLE IF NOT EXISTS compliance_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_name TEXT NOT NULL,
    deadline TEXT,
    completed INTEGER DEFAULT 0, -- 1 for true, 0 for false
    total_progress INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS compliance_task_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES compliance_tasks(id) ON DELETE CASCADE
);
