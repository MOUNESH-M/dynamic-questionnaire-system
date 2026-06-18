from app.core.securtiy import (verify_password, create_access_token)
from app.repositories.user_repository import UserRepository
from app.core.securtiy import hash_password
from datetime import datetime
class AuthService:

    @staticmethod
    def register(name:str, email:str, password: str):
        existing_user=(UserRepository.get_user_by_email(email))
        if existing_user:
            raise Exception("Email already registered")
        user={
            "name":name,
            "email":email,
            "passwordHash":hash_password(password),
            "role":"USER",
            "createdAt":datetime.utcnow()
        }

        result=(UserRepository.create_user(user))
        return {
            "userId":str(result.inserted_id),
            "message":"Registered successfully"
        }

    @staticmethod
    def login(email: str, password: str):
        user=UserRepository.get_user_by_email(email)
        if not user:
            raise Exception("Invalid email or password")
        if not verify_password(password, user['passwordHash']):
            raise Exception("Invalid email or password")
        
        token=create_access_token(
            {
                "sub":str(user["_id"]),
                "email":user["email"],
                "role":user["role"]
            }
        )

        return {
            "access_token":token,
            "token_type":"bearer",
            "role":user["role"]
        }