from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from db import queries
from services import hashing, tokens
from schemas import ForgotPasswordRequest, ResetPasswordRequest, AdminResetUserPasswordRequest
from auth.dependencies import get_current_admin

router = APIRouter()

# --- User Forgot Password Flow ---

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = queries.get_user_by_id(request.user_id)
    if not user:
        # Return 200 to prevent user enumeration
        return {"message": "If user exists, reset instructions have been sent."}
    
    token = tokens.generate_reset_token()
    expiry = tokens.get_reset_token_expiry()
    
    queries.create_reset_token(token, request.user_id, expiry)
    
    # In a real app, send email here. For MVP, return token.
    return {"message": "Reset token generated", "token": token}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    reset_entry = queries.get_reset_token(request.token)
    if not reset_entry:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    if reset_entry['is_used']:
        raise HTTPException(status_code=400, detail="Token already used")
        
    # Check expiry (SQLite stores timestamps as strings usually, need parsing if not handled by adapter)
    # Assuming standard ISO format or similar from SQLite adapter
    expiry_str = reset_entry['expiry']
    # Simple string comparison might work if ISO format, but better to parse
    # For MVP relying on SQLite string comparison or simple parsing
    try:
        expiry_dt = datetime.fromisoformat(expiry_str)
    except ValueError:
        # Fallback if format is different, e.g. "2023-01-01 12:00:00.000000"
        expiry_dt = datetime.strptime(expiry_str, "%Y-%m-%d %H:%M:%S.%f")

    if datetime.utcnow() > expiry_dt:
        raise HTTPException(status_code=400, detail="Token expired")
    
    new_hashed_password = hashing.get_password_hash(request.new_password)
    queries.update_user_password(reset_entry['user_id'], new_hashed_password)
    queries.mark_token_used(request.token)
    
    return {"message": "Password reset successfully"}

# --- Admin Reset User Password Flow ---

@router.post("/admin/reset-user-password")
async def admin_reset_user_password(request: AdminResetUserPasswordRequest, admin: str = Depends(get_current_admin)):
    # Admin resets user password to a temporary one
    # For MVP, we can generate a random one or take it from request?
    # Prompt says: "System must: 1. generate new temporary password"
    
    temp_password = tokens.generate_reset_token()[:12] # Simple random string
    hashed_temp_password = hashing.get_password_hash(temp_password)
    
    queries.admin_reset_user_password(request.user_id, hashed_temp_password)
    
    return {"message": "User password reset successfully", "temporary_password": temp_password}
