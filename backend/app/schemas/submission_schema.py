from pydantic import BaseModel
from typing import Any, List

class AnswerRequest(BaseModel):
    questionId:str
    answer: Any

class SubmissionCreateRequest(BaseModel):
    questionnaireId:str
    userId:str
    answers: List[AnswerRequest]