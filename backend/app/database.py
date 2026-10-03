"""Database configuration and session management for the application."""

from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


# Store the SQLite database in the backend directory regardless of
# which directory the application is launched from.
BACKEND_DIR = Path(__file__).resolve().parent.parent
DATABASE_PATH = BACKEND_DIR / "scans.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
)


Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Provide a database session and ensure it closes after each request."""
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()