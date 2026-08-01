# Production Deployment Guide

Target architecture:

- **Frontend**: Next.js 14 deployed on **Vercel**
- **Backend**: FastAPI deployed on **Render** (`render.yaml` blueprint)
- **Database**: PostgreSQL on **Neon** (async driver `asyncpg`)
- **AI providers**: Groq and/or OpenAI (existing integration, unchanged)

> **Northflank (buildpack) alternative:** The backend is also fully deployable
> on Northflank using standard Python buildpacks — no Docker required. See the
> README "Deploy with Buildpacks (Northflank)" section. Set the build context to
> `backend`, use a stack that supports `Aptfile` (e.g.
> `paketobuildpacks/builder-jammy-full:latest`), and let the `Procfile` provide
> the start command (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`).

## 1. Database (Neon)

1. Create a Postgres database in the Neon dashboard.
2. Copy the connection string. Both `postgres://...` and `postgresql://...`
   schemes are accepted; the backend automatically switches to the async
   driver (`postgresql+asyncpg://...`). Use `sslmode=require`.

## 2. Backend (Render)

The included `render.yaml` defines the `ai-super-app-backend` web service.
Its `startCommand` runs `alembic upgrade head && uvicorn ...`, so database
migrations are applied automatically on every deploy. The health check is
`/health`.

Set the following environment variables in the Render dashboard (these are
`sync: false` secrets in `render.yaml` — never commit them):

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon connection string with `sslmode=require` |
| `SECRET_KEY` | yes | `python -c "import secrets; print(secrets.token_urlsafe(64))"` |
| `FRONTEND_URL` | yes | e.g. `https://your-frontend.vercel.app` |
| `GROQ_API_KEY` | yes (or `OPENAI_API_KEY`) | existing AI integration |
| `OPENAI_API_KEY` | optional | |
| `ADMIN_PASSWORD` | recommended | password for the seeded admin account (default is dev-only) |
| `ADMIN_EMAIL` | optional | email for the seeded admin account (default `admin@superapp.ai`) |
| `CORS_ORIGINS` | optional | JSON array or comma-separated extra origins; `FRONTEND_URL` is always allowed |

Static variables already in `render.yaml`: `DEBUG=false`, `PYTHON_VERSION=3.12.6`.

Notes:

- The app **fails fast at startup** if `SECRET_KEY` is still a placeholder
  while `DEBUG=false`.
- `localhost`/`127.0.0.1` CORS origins are stripped automatically when
  `DEBUG=false`, so only `FRONTEND_URL` (and `CORS_ORIGINS`) are allowed.
- The starter plan runs the RAG stack (sentence-transformers) at startup; if
  the service is OOM-killed, upgrade the plan.

## 3. Frontend (Vercel)

Import the `frontend/` directory as a Next.js app (no `vercel.json` needed).
Set the build-time variable:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api/v1` |

The app reads it for all API calls and the voice-ai audio URL.

## 4. First deploy verification checklist

1. Backend: `GET /health` returns `{"status": "healthy"}`.
2. Confirm the seeded admin exists (use the `ADMIN_EMAIL`/`ADMIN_PASSWORD`
   you set) and change its password after first login.
3. Register a brand-new user via `POST /api/v1/auth/register` — the first
   deployed user flow must return `201`.
4. Login (`POST /api/v1/auth/login`, JSON body with `email`/`password`),
   hit `GET /api/v1/auth/me` with the returned token.
5. Open the Vercel URL and log in from the UI; confirm the chat/resume/tasks
   flows work end to end (they hit `NEXT_PUBLIC_API_URL`).
6. Send a malformed JSON body to any endpoint and confirm you get a clean
   `422` JSON error, not a `500`.

## 5. Local development (SQLite)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 npm run dev
```

Local dev keeps `DEBUG=true`, so localhost CORS origins in `.env` are allowed
and the placeholder `SECRET_KEY` does not fail fast.

## 6. Migrations

- Auto-applied on Render deploys (`alembic upgrade head` in `startCommand`).
- Locally: `cd backend && alembic upgrade head`.
- New changes: `alembic revision --autogenerate -m "description"`, review,
  then `alembic upgrade head`.
