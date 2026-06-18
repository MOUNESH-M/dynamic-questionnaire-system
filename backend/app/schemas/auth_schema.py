from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str