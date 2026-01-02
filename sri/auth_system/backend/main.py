from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import admin_login, user_login, change_password, password_reset, dashboard
from db import connection, queries
from services import hashing
import os

app = FastAPI(title="Auth System")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(admin_login.router, prefix="/admin", tags=["Admin"])
app.include_router(user_login.router, prefix="/user", tags=["User"])
app.include_router(change_password.router, prefix="/user", tags=["User"])
app.include_router(password_reset.router, prefix="/auth", tags=["Auth"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

@app.on_event("startup")
def startup_event():
    # Initialize DB
    if not os.path.exists(connection.DB_PATH):
        print("Initializing database...")
        connection.init_db()
        
        # Create default admin if not exists
        if not queries.get_admin_by_username("admin"):
            print("Creating default admin...")
            hashed_pwd = hashing.get_password_hash("admin123")
            queries.create_admin("admin", hashed_pwd)
            print("Default admin created: username='admin', password='admin123'")
    else:
        # Ensure tables exist even if DB file exists (e.g. empty file)
        connection.init_db()
        if not queries.get_admin_by_username("admin"):
             print("Creating default admin...")
             hashed_pwd = hashing.get_password_hash("admin123")
             queries.create_admin("admin", hashed_pwd)
             print("Default admin created: username='admin', password='admin123'")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Auth System API"}
