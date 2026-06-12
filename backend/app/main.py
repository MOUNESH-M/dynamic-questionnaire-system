from fastapi import FastAPI
from app.core.database import database

app=FastAPI(
    title="Dynamic Questionnaire System",
    version="1.0.0"
)

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