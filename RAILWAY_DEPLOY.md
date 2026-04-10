# Railway Deploy

This repository is prepared for a two-service Railway setup:

- `backend` service: Django API
- `frontend` service: Vite/React app served by Nginx

## 1. Connect the repo

Create two Railway services from the same GitHub repository.

### Backend service

- Root Directory: `/backend`
- Config as Code path: `/backend/railway.json`

### Frontend service

- Root Directory: `/frontend`
- Config as Code path: `/frontend/railway.json`

## 2. Backend variables

Set these on the Railway backend service:

- `DEBUG=False`
- `SECRET_KEY=your-long-random-secret`
- `HEALTHCHECK_STRICT_DATABASE=False`
- `FRONTEND_URL=https://your-frontend.up.railway.app`
- `CORS_ALLOWED_ORIGINS=https://your-frontend.up.railway.app`
- `CSRF_TRUSTED_ORIGINS=https://your-frontend.up.railway.app`
- `ALLOWED_HOSTS=your-backend.up.railway.app`
- `USE_SQLITE=False`
- `DATABASE_URL=...` or Railway/Supabase `PG*` variables
- `DB_SSLMODE=require` when using Supabase/Postgres over SSL
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `COOKIE_SAMESITE=None`
- `CSRF_SAMESITE=None`

Optional:

- `OPENAI_API_KEY=...`
- `AI_ALLOWED_MODELS=gpt-4o-mini`
- `AI_DAILY_TOKEN_BUDGET=50000`
- `LOG_TO_FILE=False`

The backend healthcheck is available at `/health/`.
By default it is deployment-friendly and returns `200` even if the database is temporarily unavailable, with `"status": "degraded"`.
Set `HEALTHCHECK_STRICT_DATABASE=True` if you want Railway to fail healthchecks on DB connectivity errors.
Migrations run automatically from `preDeployCommand`.

## 3. Frontend variables

Set these on the Railway frontend service:

- `VITE_API_URL=https://your-backend.up.railway.app`

The frontend image supports runtime replacement of `VITE_API_URL`, so you can change the backend URL without rebuilding local assets.
If `VITE_API_URL` is missing, the SPA will not call the correct backend and onboarding/profile requests will fail.

## 4. Deploy order

1. Deploy the backend first.
2. Copy the generated backend public URL.
3. Set `VITE_API_URL` on the frontend service.
4. Deploy the frontend.
5. Copy the frontend public URL back into backend variables:
   `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`
6. Redeploy backend once after final frontend URL is known.

## 5. Notes

- Secrets must live only in Railway variables, not in tracked files.
- `.env` files, SQLite files, logs, `node_modules`, build outputs, and local virtualenvs are ignored by git.
- Backend static files are collected in the Docker build.
- Demo document uploads use Supabase Storage bucket `secure-documents`.
