# Medical Imaging Review Dashboard

A small full-stack application for reviewing synthetic medical imaging scan records and mock AI predictions.

The project uses a FastAPI backend, SQLite persistence, and a React frontend. All scan records and predictions are programmatically generated. The application does not use real patient data, real medical images, or a real machine-learning model.

## Features

- Generate batches of synthetic CT and MRI scan records
- View scans in a paginated table
- Server-side pagination
- Server-side filtering by scan type and minimum confidence
- Search for scans by scan ID
- View detailed information for a selected scan
- Retrieve mock AI predictions
- Delete scan records
- Detect potentially duplicate synthetic records
- Export filtered scan records to CSV
- Visual indicators for scan type, confidence, and review status
- Automatic API documentation through FastAPI

## Tech Stack

### Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- SQLite
- Uvicorn

### Frontend

- React
- Vite
- JavaScript
- CSS
- Fetch API
- Oxlint

## Project Structure

```text
medical-imaging-dashboard/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── scans.py
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── mock_data.py
│   │   ├── models.py
│   │   └── schemas.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── scans.js
│   │   ├── components/
│   │   │   ├── DuplicateResults.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ScanDetail.jsx
│   │   │   ├── ScanTable.jsx
│   │   │   └── ScanToolbar.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Getting Started

The backend and frontend run as separate local development servers.

### Backend

From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/health
```

The SQLite database is created automatically when the backend starts.

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Basic API status message |
| GET | `/health` | Backend health check |
| GET | `/scans` | Retrieve paginated and filtered scans |
| POST | `/scans` | Create one synthetic scan |
| POST | `/scans/generate` | Generate multiple synthetic scans |
| GET | `/scans/duplicates` | Find potentially duplicate records |
| GET | `/scans/export/csv` | Export filtered records to CSV |
| GET | `/scans/{scan_id}` | Retrieve one scan |
| DELETE | `/scans/{scan_id}` | Delete one scan |
| GET | `/scans/{scan_id}/prediction` | Retrieve a stored mock AI prediction |

## Server-Side Pagination and Filtering

The selected project extension is server-side pagination and filtering.

`GET /scans` supports the following query parameters:

- `page`
- `page_size`
- `scan_type`
- `min_confidence`

Example:

```text
GET /scans?page=1&page_size=10&scan_type=CT&min_confidence=0.8
```

Filtering and pagination occur in the backend rather than downloading the entire dataset to the browser.

## Architecture

The application follows a simple layered structure:

```text
React frontend
      |
      | HTTP / JSON
      v
FastAPI routes
      |
      v
Pydantic validation
      |
      v
SQLAlchemy
      |
      v
SQLite
```

The frontend API client is centralized in `frontend/src/api/scans.js`, keeping request logic separate from React presentation components.

The backend separates API routing, request and response schemas, database models, database configuration, and synthetic data generation.

## Synthetic Data and Mock AI

All records are synthetic and programmatically generated.

The generator selects:

1. A scan modality
2. An anatomical region compatible with that modality
3. A possible synthetic finding associated with that region
4. A randomized confidence score
5. A synthetic review status
6. A randomized creation time

The mock prediction system uses randomized, region-aware rules. It does not perform image analysis or medical inference.

A real machine-learning model was intentionally not used because the focus of this project is application architecture, API design, data modeling, validation, and frontend/backend integration.

## Validation and Error Handling

Pydantic validates API request and response data.

Examples include:

- Patient age must be between 0 and 120
- Confidence scores must be between 0 and 1
- Generated batch sizes must be between 1 and 500
- Pagination values must be positive
- Scan type is restricted to CT or MRI

Unknown scan IDs return a `404` response.

Invalid request parameters return FastAPI/Pydantic validation errors.

The frontend displays request failures to the user.

## CSV Export

CSV export uses the same scan-type and confidence filters as the dashboard.

The export includes all records matching the active filters, rather than only the currently visible page.

Exported fields include:

- Scan ID
- Patient age
- Scan type
- Region
- Predicted condition
- Confidence score
- Review status
- Creation time

## Duplicate Detection

The duplicate checker groups synthetic records when the following values are identical:

- Patient age
- Scan type
- Region
- Predicted condition
- Confidence score

Scan ID and creation time are intentionally excluded because they uniquely identify otherwise equivalent records.

This is a demonstration heuristic rather than a clinical duplicate-detection system. Duplicate records are reported but are not automatically deleted.

## Design Decisions and Tradeoffs

### SQLite

SQLite was selected because the application has a small data model and should run locally without additional database infrastructure.

A larger production application would likely use PostgreSQL or another managed relational database.

### FastAPI and Pydantic

FastAPI provides typed request handling, automatic API documentation, and straightforward integration with Pydantic validation.

### SQLAlchemy

SQLAlchemy separates database persistence from the API layer and makes future migration to another relational database easier.

### React and Vite

React provides reusable UI components, while Vite keeps development and production builds lightweight.

### Server-Side Pagination

Pagination and filtering are performed on the server to reduce unnecessary data transfer and better represent how a larger dashboard would operate.

### Mock Prediction Logic

Randomized, region-aware prediction logic was chosen instead of a real ML model so the project remains focused on software architecture without implying clinical validity.

## Limitations

This project does not include:

- Authentication or authorization
- Real patient information
- Real medical images or DICOM files
- PACS integration
- A trained machine-learning model
- Production database migrations
- Production deployment configuration
- Automated backend or frontend test suites

CORS and the frontend API URL are configured for local development.

Database tables are created automatically at startup rather than through a migration system such as Alembic.

## Potential Future Improvements

Possible future improvements include:

- User authentication and role-based access
- Review-status editing
- DICOM metadata support
- PACS integration
- Automated unit and integration tests
- PostgreSQL persistence
- Alembic database migrations
- Environment-based configuration
- Sorting controls
- More advanced duplicate detection
- Containerized deployment
- Audit logging

## Quality Checks

The project was verified with:

```powershell
npm run lint
npm run build
python -m compileall app
```

The frontend passed linting with zero warnings and zero errors and built successfully for production.

The backend was also tested from a fresh virtual environment using only `requirements.txt`. The health endpoint and FastAPI documentation were verified after startup.

## Disclaimer

This application uses exclusively synthetic, programmatically generated data.

The displayed findings and confidence scores are mock values intended only to demonstrate software behavior.

**This application is not intended for clinical use or medical decision-making.**