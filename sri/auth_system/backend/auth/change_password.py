from fastapi import APIRouter, HTTPException, status, Depends
from db import queries
from services import hashing
from schemas import ChangePasswordRequest
from auth.dependencies import get_current_user

router = APIRouter()

@router.post("/change-password")
async def change_password(request: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    if not hashing.verify_password(request.old_password, current_user['hashed_password']):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    new_hashed_password = hashing.get_password_hash(request.new_password)
    queries.update_user_password(current_user['user_id'], new_hashed_password)
    
    return {"message": "Password updated successfully"}
