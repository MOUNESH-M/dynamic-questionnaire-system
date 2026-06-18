from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from app.core.config import settings

security=HTTPBearer()

def get_current_user(token=Depends(security)):
    payload=jwt.decode(
        token.credentials,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM]
    )

    return payload

def admin_required(current_user=Depends(get_current_user)):
    if current_user["role"]!="ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user