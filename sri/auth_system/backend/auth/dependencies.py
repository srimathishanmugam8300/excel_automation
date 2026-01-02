from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from services import tokens
from db import queries

oauth2_scheme_admin = OAuth2PasswordBearer(tokenUrl="admin/login")
oauth2_scheme_user = OAuth2PasswordBearer(tokenUrl="user/login")

async def get_current_admin(token: str = Depends(oauth2_scheme_admin)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = tokens.verify_token(token, credentials_exception)
    username: str = payload.get("sub")
    role: str = payload.get("role")
    if role != "admin":
        raise credentials_exception
    return username

async def get_current_user(token: str = Depends(oauth2_scheme_user)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = tokens.verify_token(token, credentials_exception)
    user_id: str = payload.get("sub")
    role: str = payload.get("role")
    if role != "user":
        raise credentials_exception
        
    user = queries.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user
