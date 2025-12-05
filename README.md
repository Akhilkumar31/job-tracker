# Job Application Tracker — Full Project

Complete project: Spring Boot 3 + JWT + PostgreSQL + Flyway + scheduled email reminders + React + Vite + Tailwind + Recharts + inline reminder UI + AI resume matcher (mock by default).

## Monorepo Layout
```
job-tracker/
├─ backend/      # Spring Boot app
├─ frontend/     # React app with inline reminders
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## Prerequisites
- Java 17 (Temurin/OpenJDK)
- Maven 3.9+
- Node.js 18+ and npm 9+
- Docker + Docker Compose

## Quick Start (Dev)
1. Clone and set env:
   ```bash
   cp .env.example .env
   ```
2. Start Postgres + MailHog:
   ```bash
   docker compose up -d
   # DB: localhost:5432 ; MailHog UI: http://localhost:8025
   ```
3. Run backend:
   ```bash
   cd backend
   mvn spring-boot:run
   # Swagger: http://localhost:8080/swagger
   ```
4. Run frontend:
   ```bash
   cd ../frontend
   npm i
   npm run dev
   # http://localhost:5173
   ```

## First Run
- Register new account in the UI.
- Go to **Applications** → add an application.
- Under a row, click **+ Reminder**, set datetime + message → **Save**.
- When the time passes, check **MailHog** for the email reminder.

## AI Resume Keyword Match
### Mock Mode (default)
- If `OPENAI_API_KEY` is **empty**, the backend returns a deterministic mock JSON:
  ```json
  { "score": 70, "missing_keywords": ["..."], "mode": "MOCK" }
  ```

### Enable Real OpenAI
1. Set your key (temporarily in shell or in `.env`):
   ```bash
   export OPENAI_API_KEY=sk-xxxx
   # or edit .env -> OPENAI_API_KEY=sk-xxxx
   ```
2. Restart backend:
   ```bash
   cd backend && mvn spring-boot:run
   ```
3. The response will come from OpenAI (model: `gpt-4o-mini`).

> To revert to mock mode, unset the key or leave it blank in `.env` and restart the backend.

## Troubleshooting
- **401 Unauthorized**: login again; token stored in localStorage may be missing/expired.
- **DB connection errors**: confirm `.env` `DB_USER/DB_PASS` match docker compose values.
- **Migrations missing**: check backend logs for Flyway; restart backend after DB is up.
- **Emails not visible**: open MailHog at http://localhost:8025 .
- **CORS/Proxy issues in prod**: configure reverse proxy or enable CORS in Spring.

## API Cheatsheet
- `POST /api/auth/register` {{ email, password }} → token
- `POST /api/auth/login` {{ email, password }} → token
- `GET /api/apps`, `POST /api/apps`, `PATCH /api/apps/{{id}}`, `DELETE /api/apps/{{id}}`
- `GET /api/reminders`, `POST /api/reminders` {{ applicationId, remindAt (ISO), message }}
- `GET /api/analytics/status-counts`
- `POST /api/ai/match` {{ resumeText, jobDescription }}

## Notes
- Scheduler runs every minute (cron `0 * * * * *`). Ensure backend stays running.
- Keep `JWT_SECRET` strong in production.
- Swap SMTP to SendGrid/other by setting `spring.mail.*` in `backend/src/main/resources/application.yml` or env.
