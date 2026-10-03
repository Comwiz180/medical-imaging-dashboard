"""Synthetic scan and mock prediction generation.

All values produced by this module are randomly generated for demonstration
purposes only. The prediction logic does not perform medical inference and
must not be used for clinical decision-making.
"""

import random
from datetime import datetime, timedelta
from uuid import uuid4


MIN_PATIENT_AGE = 18
MAX_PATIENT_AGE = 90

MIN_CONFIDENCE = 0.55
MAX_CONFIDENCE = 0.99

MAX_SCAN_AGE_DAYS = 90


CONDITIONS_BY_REGION = {
    "Chest": [
        "No acute abnormality",
        "Pulmonary nodule",
        "Consolidation",
        "Pleural effusion",
    ],
    "Brain": [
        "No acute abnormality",
        "Ischemic change",
        "Mass lesion",
        "White matter changes",
    ],
    "Nasal Cavity": [
        "No acute abnormality",
        "Sinusitis",
        "Mucosal thickening",
        "Nasal polyp",
    ],
    "Knee": [
        "No acute abnormality",
        "Meniscal tear",
        "Joint effusion",
        "Degenerative changes",
    ],
    "Spine": [
        "No acute abnormality",
        "Disc herniation",
        "Spinal stenosis",
        "Degenerative changes",
    ],
    "Shoulder": [
        "No acute abnormality",
        "Rotator cuff tear",
        "Joint effusion",
        "Degenerative changes",
    ],
    "Abdomen": [
        "No acute abnormality",
        "Hepatic lesion",
        "Renal cyst",
        "Bowel wall thickening",
    ],
}


SCAN_TYPE_REGIONS = {
    "CT": [
        "Chest",
        "Brain",
        "Nasal Cavity",
        "Abdomen",
    ],
    "MRI": [
        "Brain",
        "Knee",
        "Spine",
        "Shoulder",
    ],
}


REVIEW_STATUSES = [
    "unreviewed",
    "reviewed",
    "flagged",
]

# Most newly generated scans begin as unreviewed.
REVIEW_STATUS_WEIGHTS = [
    0.60,
    0.30,
    0.10,
]


def generate_prediction(region: str) -> tuple[str, float]:
    """Generate a randomized condition and confidence score for a region."""
    conditions = CONDITIONS_BY_REGION.get(
        region,
        ["No significant abnormality"],
    )

    predicted_condition = random.choice(conditions)
    confidence_score = round(
        random.uniform(MIN_CONFIDENCE, MAX_CONFIDENCE),
        2,
    )

    return predicted_condition, confidence_score


def generate_mock_scan() -> dict[str, object]:
    """Generate one complete synthetic scan record."""
    scan_type = random.choice(list(SCAN_TYPE_REGIONS))

    # Restrict regions by modality so generated records remain plausible.
    region = random.choice(
        SCAN_TYPE_REGIONS[scan_type]
    )

    predicted_condition, confidence_score = generate_prediction(
        region
    )

    created_at = datetime.now() - timedelta(
        days=random.randint(0, MAX_SCAN_AGE_DAYS),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )

    review_status = random.choices(
        REVIEW_STATUSES,
        weights=REVIEW_STATUS_WEIGHTS,
        k=1,
    )[0]

    return {
        "scan_id": f"SCAN-{uuid4().hex[:8].upper()}",
        "patient_age": random.randint(
            MIN_PATIENT_AGE,
            MAX_PATIENT_AGE,
        ),
        "scan_type": scan_type,
        "region": region,
        "confidence_score": confidence_score,
        "predicted_condition": predicted_condition,
        "review_status": review_status,
        "created_at": created_at,
    }