from bson import ObjectId
from app.core.database import rules_collection

class RuleRepsitory:
    @staticmethod
    def create(rule: dict):
        return rules_collection.insert_one(rule)
    
    @staticmethod
    def get_all():
        return list(rules_collection.find())
    
    @staticmethod
    def get_by_id(rule_id:str):
        return rules_collection.find_one({"_id":ObjectId(rule_id)})
    
    @staticmethod
    def get_rule_by_question_and_option(question_id:str, option_id:str):
        return rules_collection.find_one({
            "questionId":question_id,
            "optionId":option_id,
            "isActive":True
        })
    
    @staticmethod
    def delete(rule_id:str):
        return rules_collection.delete_one({"_id":ObjectId(rule_id)})