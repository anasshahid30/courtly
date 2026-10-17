from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401 (registers tables)
from app.core.config import settings
from app.db import Base, engine
from app.routes.admin import router as admin_router
from app.routes.auth import router as auth_router
from app.routes.certificates import router as certificates_router
from app.routes.domains import router as domains_router
from app.routes.sessions import router as sessions_router
from app.routes.simulations import router as simulations_router
from app.routes.trial import router as trial_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Courtly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(domains_router)
app.include_router(auth_router)
app.include_router(simulations_router)
app.include_router(sessions_router)
app.include_router(certificates_router)
app.include_router(admin_router)
app.include_router(trial_router)


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}
