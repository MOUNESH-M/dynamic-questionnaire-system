from pydantic import BaseModel
from typing import Optional
from app.enum.question_type import (QuestionType)

class QuestionCreateRequest(BaseModel):
    questionnaireId:str
    questionText:str
    questionType:QuestionType
    isStarQuestion:bool=False

class QuestionUpdateRequest(BaseModel):
    questionText: Optional[str]=None
    questionType: Optional[str]=None
    isStarQuestion: Optional[str]=None
    isActive: Optional[str]=None