# Courtly Backend API

The Courtly backend is a FastAPI and SQLAlchemy service powering a virtual courtroom simulation platform for practicing business law advocacy.

---

## What the Backend Does

- **Advocate Authentication & Accounts**: Secure user registration, login with Argon2 password hashing, and JWT token issuance.
- **Simulation Cases & Levels**: Five advocacy progression levels with fictional business dispute cases and evidence documents.
- **Courtroom Proceedings**: Step-by-step trial dialogue turns, legal evidentiary objections (hearsay, relevance, leading, etc.), and trial stage advances (stages 0 through 5).
- **Advocacy Scoring**: Standardized scoring across 8 criteria (e.g., radical clarity, evidence handling, anticipating counter-moves) with overall pass threshold of 85.0.
- **Progress Tracking & Certificates**: Tracks level statuses (`NOT_STARTED`, `IN_PROGRESS`, `PASSED`) and issues tamper-proof certificates when all five levels are passed with an average score of 90.0 or higher.
- **Appeals & Human Review**: Allows advocates to appeal completed session scores and provides educator/admin review workflows.
- **Role-Based Access Control**: Three distinct user roles: `learner` (default), `educator`, and `admin`.

---

## Windows Setup Guide

### 1. Prerequisites
- Python 3.12 or newer installed on Windows.
- PowerShell or Windows Command Prompt.

### 2. Create and Activate Virtual Environment
Open PowerShell, navigate to the `backend` folder, and run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

*(If PowerShell execution policies block script activation, run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` once).*

### 3. Install Dependencies
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## Running the Server

Start the local development server with auto-reload:

```powershell
uvicorn app.main:app --reload --port 8000
```

Once running:
- **API Base URL**: `http://localhost:8000`
- **Interactive Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **Alternative Documentation (ReDoc)**: `http://localhost:8000/redoc`

---

## Running Tests

Run the full automated test suite using `pytest`:

```powershell
pytest -v
```

All tests execute against SQLite database transactions with automatic state isolation.

---

## Environment Variables

Configuration is loaded using `pydantic-settings`. You can copy `.env.example` to create your own local settings.

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `COURTLY_ENV` | `development` | Operating environment (`development` or `production`). |
| `JWT_SECRET` | `dev-only-change-me` | Secret key used to sign access tokens. **In production, the application refuses to start if this is missing or set to the default value.** |
| `DATABASE_URL` | `sqlite:///./courtly.db` | SQLAlchemy database connection string. |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated list of allowed frontend origins for CORS. |

---

## Making a User an Administrator

You can promote any existing registered user to an administrator from the command line:

```powershell
python app/manage.py make-admin <user-email>
```

**Example:**
```powershell
python app/manage.py make-admin test@courtly.dev
```

If the user exists, their role is updated immediately to `admin`. If the user does not exist, a clear error message is displayed and the command exits with code 1.
