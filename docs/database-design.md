#Users:
{
  "_id": "",
  "name": "",
  "email": "",
  "password":"",
  "role": "ADMIN | USER"
}

#Questions
{
    "_id":"",
    "question":"",
    "questionType":"",
    "isActive": true | false,
    "createdAt":""
}

#Options
{
    "_id":"",
    "questionId":"",
    "text":""
}

#Rules:
{
    "_id": "",
    "questionId":"",
    "optionId":"",
    "nextQuestionId":"",
    "isActive":true | false
}

#Response:
{
    "_id":"",
    "userId":"",
    "answers": []
}