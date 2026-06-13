from app.core.securtiy import (verify_password, create_access_token)
from app.repositories.user_repository import UserRepository

class AuthService:

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