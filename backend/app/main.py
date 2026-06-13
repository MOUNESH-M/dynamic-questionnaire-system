from fastapi import FastAPI
from app.core.database import database
from app.routers.auth import router as auth_router
from app.routers.questionnaire import router as questionnaire_router
from app.routers.question import router as question_router
from app.routers.option import router as option_router
from app.routers.submission import router as submission_router
app=FastAPI(
    title="Dynamic Questionnaire System",
    version="1.0.0"
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(questionnaire_router, prefix="/api/v1")
app.include_router(question_router, prefix="/api/v1")
app.include_router(option_router, prefix="/api/v1")
app.include_router(submission_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
def health_check()->dict:
    #Application health check.
    return{"status":"UP"}

@app.get("/health/db", tags=["Health"])
def database_health_check() -> dict:
    try:
        database.command("ping")
        return {
            "status": "UP",
            "database": "CONNECTED"
        }
    except Exception as e:
        return {
            "status": "DOWN",
            "database": "DISCONNECTED",
            "error": str(e)
        }