"""API routes for creating, retrieving, filtering, and managing scan records."""

import csv
from datetime import datetime
from io import StringIO
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.mock_data import generate_mock_scan, generate_prediction
from app.models import ScanRecord
from app.schemas import (
    GenerateScansRequest,
    PaginatedScans,
    PredictionResponse,
    Scan,
    ScanCreate,
    ScanType,
)


router = APIRouter(
    prefix="/scans",
    tags=["scans"],
)


def get_scan_or_404(db: Session, scan_id: str) -> ScanRecord:
    """Return a scan by ID or raise a 404 response if it does not exist."""
    scan = (
        db.query(ScanRecord)
        .filter(ScanRecord.scan_id == scan_id)
        .first()
    )

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail="Scan not found",
        )

    return scan


def apply_scan_filters(
    query,
    scan_type: ScanType | None,
    min_confidence: float | None,
):
    """Apply optional modality and confidence filters to a scan query."""
    if scan_type is not None:
        query = query.filter(
            ScanRecord.scan_type == scan_type.value
        )

    if min_confidence is not None:
        query = query.filter(
            ScanRecord.confidence_score >= min_confidence
        )

    return query


@router.post("", response_model=Scan)
def create_scan(
    scan: ScanCreate,
    db: Session = Depends(get_db),
):
    """Create one synthetic scan and generate a mock AI prediction."""
    predicted_condition, confidence_score = generate_prediction(
        scan.region
    )

    db_scan = ScanRecord(
        scan_id=f"SCAN-{uuid4().hex[:8].upper()}",
        patient_age=scan.patient_age,
        scan_type=scan.scan_type.value,
        region=scan.region,
        confidence_score=confidence_score,
        predicted_condition=predicted_condition,
        review_status="unreviewed",
        created_at=datetime.now(),
    )

    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)

    return db_scan


@router.get("", response_model=PaginatedScans)
def get_scans(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    scan_type: ScanType | None = None,
    min_confidence: float | None = Query(
        default=None,
        ge=0.0,
        le=1.0,
    ),
    db: Session = Depends(get_db),
):
    """Return a filtered and paginated list of scan records."""
    query = apply_scan_filters(
        db.query(ScanRecord),
        scan_type,
        min_confidence,
    )

    total = query.count()
    total_pages = (
        (total + page_size - 1) // page_size
        if total > 0
        else 0
    )

    offset = (page - 1) * page_size

    scans = (
        query
        .order_by(ScanRecord.created_at.desc())
        .offset(offset)
        .limit(page_size)
        .all()
    )

    return PaginatedScans(
        items=scans,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/generate")
def generate_scans(
    request: GenerateScansRequest,
    db: Session = Depends(get_db),
):
    """Generate and store multiple entirely synthetic scan records."""
    for _ in range(request.count):
        scan_data = generate_mock_scan()
        db.add(ScanRecord(**scan_data))

    db.commit()

    return {
        "message": f"Generated {request.count} synthetic scans",
        "count": request.count,
    }


@router.get("/duplicates")
def get_duplicate_scans(
    db: Session = Depends(get_db),
):
    """Find scan groups with identical synthetic clinical attributes."""
    scans = db.query(ScanRecord).all()

    grouped_scans = {}

    for scan in scans:
        # Scan ID and creation time are intentionally excluded because they
        # uniquely identify otherwise equivalent synthetic records.
        duplicate_key = (
            scan.patient_age,
            scan.scan_type,
            scan.region,
            scan.predicted_condition,
            scan.confidence_score,
        )

        grouped_scans.setdefault(duplicate_key, []).append(scan)

    duplicate_groups = []

    for group in grouped_scans.values():
        if len(group) <= 1:
            continue

        first_scan = group[0]

        duplicate_groups.append(
            {
                "count": len(group),
                "scan_ids": [
                    scan.scan_id
                    for scan in group
                ],
                "patient_age": first_scan.patient_age,
                "scan_type": first_scan.scan_type,
                "region": first_scan.region,
                "predicted_condition": (
                    first_scan.predicted_condition
                ),
                "confidence_score": (
                    first_scan.confidence_score
                ),
            }
        )

    return {
        "duplicate_groups": duplicate_groups,
        "duplicate_group_count": len(duplicate_groups),
    }


@router.get("/export/csv")
def export_scans_csv(
    scan_type: ScanType | None = None,
    min_confidence: float | None = Query(
        default=None,
        ge=0.0,
        le=1.0,
    ),
    db: Session = Depends(get_db),
):
    """Export all scans matching the active filters as a CSV file."""
    query = apply_scan_filters(
        db.query(ScanRecord),
        scan_type,
        min_confidence,
    )

    scans = (
        query
        .order_by(ScanRecord.created_at.desc())
        .all()
    )

    output = StringIO(newline="")
    writer = csv.writer(output)

    writer.writerow(
        [
            "scan_id",
            "patient_age",
            "scan_type",
            "region",
            "predicted_condition",
            "confidence_score",
            "review_status",
            "created_at",
        ]
    )

    for scan in scans:
        writer.writerow(
            [
                scan.scan_id,
                scan.patient_age,
                scan.scan_type,
                scan.region,
                scan.predicted_condition,
                scan.confidence_score,
                scan.review_status,
                scan.created_at.isoformat(),
            ]
        )

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": (
                'attachment; filename="synthetic_scans.csv"'
            )
        },
    )


@router.get(
    "/{scan_id}/prediction",
    response_model=PredictionResponse,
)
def get_prediction(
    scan_id: str,
    db: Session = Depends(get_db),
):
    """Return the stored mock AI prediction for a specific scan."""
    scan = get_scan_or_404(db, scan_id)

    return PredictionResponse(
        scan_id=scan.scan_id,
        predicted_condition=scan.predicted_condition,
        confidence_score=scan.confidence_score,
    )


@router.get("/{scan_id}", response_model=Scan)
def get_scan(
    scan_id: str,
    db: Session = Depends(get_db),
):
    """Return the complete record for one scan."""
    return get_scan_or_404(db, scan_id)


@router.delete("/{scan_id}")
def delete_scan(
    scan_id: str,
    db: Session = Depends(get_db),
):
    """Delete one scan record by its unique scan ID."""
    scan = get_scan_or_404(db, scan_id)

    db.delete(scan)
    db.commit()

    return {
        "message": f"Deleted scan {scan_id}"
    }