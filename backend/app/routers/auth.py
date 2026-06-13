from fastapi import APIRouter, HTTPException

from app.schemas.auth_schema import (LoginRequest, LoginResponse)
from app.services.auth_service import AuthService

router=APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    try:
        return AuthService.login(
            request.email,
            request.password
        )
    except Exception as exception:
        raise HTTPException(
            status_code=401,
            detail=str(exception)
        )