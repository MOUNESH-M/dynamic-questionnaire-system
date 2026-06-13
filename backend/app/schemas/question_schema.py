from pydantic import BaseModel
from typing import Optional

class QuestionCreateRequest(BaseModel):
    questionnaireId:str
    questionText:str
    questionType:str
    isStartQuestion:bool=False

class QuestionUpdateRequest(BaseModel):
    questionText: Optional[str]=None
    questionType: Optional[str]=None
    isStarQuestion: Optional[str]=None
    isActive: Optional[str]=None