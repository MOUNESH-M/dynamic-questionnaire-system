from fastapi import APIRouter
from app.schemas.rule_schema import (RuleCreatedRequest)
from app.services.rule_service import RuleService

router=APIRouter(
    prefix="/rules",
    tags=["Rules"]
)

@router.post("")
def create_rule(request: RuleCreatedRequest):
    rule_id=(RuleService.create_rule(
        request.questionId,
        request.optionId,
        request.nextQuestionId
    ))
    return {"ruleId":rule_id}

@router.get("")
def get_rules():
    return RuleService.get_all()

@router.delete("/{rule_id}")
def delete_rule(rule_id:str):
    RuleService.delete_rule(rule_id)
    return {"message":"Rule Deleted"}