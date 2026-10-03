"""SQLAlchemy database models for medical imaging scan records."""

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ScanRecord(Base):
    """Persistent database representation of a synthetic imaging scan."""

    __tablename__ = "scans"

    # Internal database key. The public-facing identifier is scan_id.
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    scan_id: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    patient_age: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    scan_type: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    region: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    confidence_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    predicted_condition: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    review_status: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="unreviewed",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )