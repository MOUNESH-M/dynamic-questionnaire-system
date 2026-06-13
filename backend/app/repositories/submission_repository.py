from app.core.database import submissions_collection

class SubmissionRepository:
    @staticmethod
    def create(submission: dict):
        return submissions_collection.insert_one(submission)
    
    @staticmethod
    def get_all():
        return list(submissions_collection.find())
    
    @staticmethod
    def get_by_user_id(user_id: str):
        return submissions_collection.find({"userId": user_id})