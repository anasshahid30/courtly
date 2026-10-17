from fastapi import FastAPI
from app.db import Base, engine
from app import models  # noqa: F401 (registers the User table)
from app.routes.domains import router as domains_router
from app.routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Courtly API")
app.include_router(domains_router)
app.include_router(auth_router)


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}
