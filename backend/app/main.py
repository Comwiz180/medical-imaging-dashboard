"""FastAPI application entry point and global configuration."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine
from app.routes.scans import router as scans_router


# Create database tables that do not already exist.
models.Base.metadata.create_all(bind=engine)


FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app = FastAPI(
    title="Medical Imaging Review API",
    description=(
        "Backend API for a synthetic medical imaging review dashboard."
    ),
    version="0.1.0",
)


# Allow the local React development server to access the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(scans_router)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    """Return a basic message confirming that the API is running."""
    return {
        "message": "Medical Imaging Review API is running"
    }


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Return a lightweight health check for the backend service."""
    return {
        "status": "healthy"
    }