from enum import Enum

class QuestionType(str, Enum):
    SINGLE_CHOISE="SINGLE_CHOISE"
    MULTIPLE_CHOISE="MULTIPLE_CHOISE"
    TEXT="TEXT"
    NUMBER="NUMBER"