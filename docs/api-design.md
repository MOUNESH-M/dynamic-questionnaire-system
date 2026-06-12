Authentication:
Login:
`POST /api/v1/auth/login`
request:
```json
{

"email":"",

"password":""

}```
response:
```json
{

"accessToken":"",

"role":""

}```
_________________________________________________________
Questionnaire APIs:
Create Questionnaire:
`POST /api/v1/questionnaires`
request:
```json
{
    "title":"",
    "description":""
}```
-----------------------------------------
Get All Questionnaires:
`GET /api/v1/questionnaires`
-----------------------------------------
Get Questionnaire by ID:
`GET /api/v1/qestionnaires/{questionnaireID}`
__________________________________________________________
Question APIs:
Create Question:
`POST /api/v1/questions`
request:
```json
{
    "questionnaireID":"",
    "questionText":"",
    "questionType":"",
    "isStartQuestion":""
}```
-----------------------------------------
Get Questions:
`GET /api/v1/questions`
-----------------------------------------
update Questions:
`PUT /api/v1/questions/{questionId}`
-----------------------------------------
Delete Question:
`DELETE /api/v1/questions/{questionsId}`
____________________________________________________________
Option APIs:
Create Option:
`POST /api/v1/options`
Request:
```json
{
    "questionId":"",
    "optionText":""
}```
-----------------------------------------
Get Options:
`GET /api/v1/questions/{questionId}/options`
_____________________________________________________________
Rule APIs:
create Rule:
`POST /api/v1/rules`
request:
```json
{
    "questionID":"",
    "conditionType":"",
    "conditionValue":"",
    "nextQuestionId":""
}```
------------------------------------------
Get Rules:
`GET /api/v1/rules`
-----------------------------------------
update rule;
`PUT /api/v1/rules/{ruleId}`
_______________________________________________________________
User Flow APIs:
Start Questionnaire:
`GET /api/v1/questionnaires/{questionnaireId}/start`
Response:
```json
{
    "questionId":"",
    "questionText":""
}```
-----------------------------------------
Submit Answer:
`POST /api/v1/questionnaires/answer`
request:
```json
{
    "submittedId":"",
    "questionId":"",
    "answer":""
}```
Response:
```json
{
    "nextQuestionId":"",
    "questionText":""
}```
-----------------------------------------
Complete Questionnaire:
`POST /api/v1/questionnaire/submit`