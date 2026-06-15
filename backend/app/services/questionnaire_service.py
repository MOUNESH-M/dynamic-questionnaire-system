from datetime import datetime
from app.repositories.questionnaire_repository import (QuestionnaireRepository)

class QuestionnaireService:

    @staticmethod
    def create_questionnaire(title: str, description: str, created_by: str):
        questionnaire={
            "title":title,
            "description":description,
            "status":"DRAFT",
            "createdBy":created_by,
            "createdAt": datetime.utcnow(),
            "updatedAt":datetime.utcnow()
        }

        result = QuestionnaireRepository.create(questionnaire)
        return str(result.inserted_id)
    
    @staticmethod
    def get_all():
        questionnaires=(QuestionnaireRepository.get_all())

        for questionnaire in questionnaires:
            questionnaire["_id"]=str(questionnaire["_id"])
        
        return questionnaires
    
    @staticmethod
    def get_by_id(questionnaire_id: str):
        questionnaire=(QuestionnaireRepository.get_by_id(questionnaire_id))

        if questionnaire:
            questionnaire["_id"]=str(questionnaire["_id"])
        
        return questionnaire
    
    @staticmethod
    def update_questionnaire(questionnaire_id: str, data:dict):
        data["updatedAt"]=datetime.utcnow()
        QuestionnaireRepository.update(questionnaire_id, data)

    @staticmethod
    def delete_questionnaire(questionnaire_id:str):
        QuestionnaireRepository.delete(questionnaire_id)
