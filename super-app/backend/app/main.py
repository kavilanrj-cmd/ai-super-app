from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db, close_db
from app.utils.seed import seed_admin
from app.core.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    general_exception_handler,
)
from app.middleware.rate_limit import RateLimitMiddleware
from app.api.v1 import auth, users, chat, resume, documents, jobs, tasks, ai, analytics, upload, admin, notifications
from app.auth import oauth
from sqlalchemy.exc import SQLAlchemyError
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_admin()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs("chroma_db", exist_ok=True)
    os.makedirs("faiss_index", exist_ok=True)
    yield
    await close_db()
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Super App - One Platform for Everything",
    lifespan=lifespan,
)

app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(chat.router, prefix=api_prefix)
app.include_router(resume.router, prefix=api_prefix)
app.include_router(documents.router, prefix=api_prefix)
app.include_router(jobs.router, prefix=api_prefix)
app.include_router(tasks.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)
app.include_router(upload.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(oauth.router, prefix=api_prefix)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
async def root():
    return {"message": "AI Super App API", "version": settings.APP_VERSION, "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
