"""Pydantic schemas used to validate API requests and responses."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ScanType(str, Enum):
    """Supported medical imaging modalities."""

    CT = "CT"
    MRI = "MRI"


class ReviewStatus(str, Enum):
    """Possible review states for a scan."""

    UNREVIEWED = "unreviewed"
    REVIEWED = "reviewed"
    FLAGGED = "flagged"


class ScanCreate(BaseModel):
    """Data required to create one synthetic scan."""

    patient_age: int = Field(
        ge=0,
        le=120,
        description="Synthetic patient age in years.",
    )
    scan_type: ScanType
    region: str = Field(
        min_length=1,
        max_length=100,
        description="Anatomic region represented by the scan.",
    )


class Scan(BaseModel):
    """Complete scan record returned by the API."""

    scan_id: str
    patient_age: int = Field(ge=0, le=120)
    scan_type: ScanType
    region: str
    confidence_score: float = Field(
        ge=0.0,
        le=1.0,
        description="Mock AI confidence score between 0 and 1.",
    )
    predicted_condition: str
    review_status: ReviewStatus
    created_at: datetime

    # Allows Pydantic to construct this schema directly from
    # SQLAlchemy ScanRecord objects.
    model_config = ConfigDict(from_attributes=True)


class PaginatedScans(BaseModel):
    """Paginated response returned by the scan-list endpoint."""

    items: list[Scan]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1, le=100)
    total_pages: int = Field(ge=0)


class GenerateScansRequest(BaseModel):
    """Request body for bulk synthetic scan generation."""

    count: int = Field(
        default=50,
        ge=1,
        le=500,
        description="Number of synthetic scans to generate.",
    )


class PredictionResponse(BaseModel):
    """Mock AI prediction returned for a single scan."""

    scan_id: str
    predicted_condition: str
    confidence_score: float = Field(
        ge=0.0,
        le=1.0,
    )