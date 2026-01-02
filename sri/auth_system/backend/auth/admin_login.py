from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from db import queries
from services import hashing, tokens
from schemas import Token, CreateUserRequest
from auth.dependencies import get_current_admin

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    admin = queries.get_admin_by_username(form_data.username)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not hashing.verify_password(form_data.password, admin['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = tokens.create_access_token(
        data={"sub": admin['username'], "role": "admin"}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": "admin"}

@router.post("/create-user")
async def create_user(user: CreateUserRequest, admin: str = Depends(get_current_admin)):
    existing_user = queries.get_user_by_id(user.user_id)
    if existing_user:
        raise HTTPException(status_code=400, detail="User ID already exists")
    
    # Use hash_password as per requirements
    hashed_password = hashing.hash_password(user.password)
    success = queries.create_user(user.user_id, user.email, hashed_password, admin)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to create user")
        
    return {"message": "User created successfully"}


@router.get("/users")
async def get_users(admin: str = Depends(get_current_admin)):
    users = queries.get_all_users()
    return [dict(u) for u in users]
