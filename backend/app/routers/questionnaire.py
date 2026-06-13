from fastapi import (APIRouter, HTTPException)
from app.schemas.questionnaire_schema import (QuestionnaireCreateRequest, QuestionnaireResponse, QuestionnaireUpdateRequest)
from app.services.questionnaire_service import (QuestionnaireService)

router=APIRouter(
    prefix="/api/v1/questionnaires",
    tags=["Questionnaires"]
)

@router.post("")
def create_questionnaire(request: QuestionnaireCreateRequest):
    questionnaire_id=(
        QuestionnaireService.create_questionnaire(
            request.title,
            request.description,
            "ADMIN"
        )
    )

    return {"questionnaireId":questionnaire_id}

@router.get("")
def get_questionnaires():
    return (QuestionnaireService.get_all())

@router.get("/{questionnaire_id}")
def get_questionnaire(questionnaire_id:str):
    questionnaire=(
        QuestionnaireService.get_by_id(questionnaire_id)
    )

    if not questionnaire:
        raise HTTPException(
            status_code=404,
            detail="Questionnaire not found"
        )
    return questionnaire

@router.put("/{questionnaire_id}")
def update_questionnaire(questionnaire_id:str, request: QuestionnaireUpdateRequest):
    QuestionnaireService.update_questionnaire(questionnaire_id, request.model_dump(exclude_none=True))

    return {"message":"Questionnaire updated"}

@router.delete("/{questionnaire_id}")
def delete_questionnaire(questionnaire_id: str):
    QuestionnaireService.delete_questionnaire(questionnaire_id)
    return {"message":"Questionnaire deleted"}