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
