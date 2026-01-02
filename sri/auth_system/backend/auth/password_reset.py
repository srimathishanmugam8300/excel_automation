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
    try:
        reset_entry = queries.get_reset_token(request.token)
        if not reset_entry:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        if reset_entry['is_used']:
            raise HTTPException(status_code=409, detail="Token already used")
            
        expiry_str = reset_entry['expiry']
        try:
            expiry_dt = datetime.strptime(expiry_str, "%Y-%m-%d %H:%M:%S.%f")
        except ValueError:
            try:
                expiry_dt = datetime.strptime(expiry_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                try:
                    expiry_dt = datetime.fromisoformat(expiry_str)
                except ValueError:
                    print(f"Date parsing failed for: {expiry_str}")
                    raise HTTPException(status_code=500, detail="Internal Server Error: Date parsing failed")

        if datetime.utcnow() > expiry_dt:
            raise HTTPException(status_code=401, detail="Token expired")
        
        new_hashed_password = hashing.hash_password(request.new_password)
        
        # Update user: set password, clear first_login, activate account
        queries.update_user_for_reset(reset_entry['user_id'], new_hashed_password)
        
        # Mark token as used
        queries.mark_token_used(request.token)
        
        return {"message": "Password reset successfully"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# --- Admin Reset User Password Flow ---

@router.post("/admin/reset-user-password")
async def admin_reset_user_password(request: AdminResetUserPasswordRequest, admin: str = Depends(get_current_admin)):
    # Admin resets user password to a temporary one
    # For MVP, we can generate a random one or take it from request?
    # Prompt says: "System must: 1. generate new temporary password"
    
    temp_password = tokens.generate_reset_token()[:12] # Simple random string
    hashed_temp_password = hashing.hash_password(temp_password)
    
    queries.admin_reset_user_password(request.user_id, hashed_temp_password)
    
    return {"message": "User password reset successfully", "temporary_password": temp_password}

