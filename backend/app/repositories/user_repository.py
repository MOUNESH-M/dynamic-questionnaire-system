from bson import ObjectId
from app.core.database import users_collection

class UserRepository:

    @staticmethod
    def get_user_by_email(email: str):
        return users_collection.find_one({"email":email})
    
    @staticmethod
    def create_user(user: dict):
        return users_collection.insert_one(user)
    
    @staticmethod
    def get_user_by_id(user_id: str):
        return users_collection.find_one({"_id":ObjectId(user_id)})