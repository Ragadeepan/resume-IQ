# ResumeIQ

ResumeIQ is a production-shaped full-stack platform for resume parsing, ATS scoring, AI-guided improvements, and live job matching. The repository is split into a Next.js frontend and an Express + Prisma backend so the UI and API can scale independently.

## Stack

- Next.js App Router + Tailwind CSS
- Express REST API
- PostgreSQL + Prisma ORM
- JWT authentication + bcrypt password hashing
- Cloudinary for resume storage
- OpenAI for resume feedback and bullet rewriting
- RapidAPI JSearch for live job discovery
- Recharts for dashboard visualizations

## Monorepo Layout

```text
.
|-- client
|-- server
|-- docker-compose.yml
`-- package.json
```

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start PostgreSQL locally:

   ```bash
   docker compose up -d
   ```

3. Copy environment templates:

   ```bash
   Copy-Item server/.env.example server/.env
   Copy-Item client/.env.example client/.env.local
   ```

4. Generate the Prisma client and run migrations:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

   For schema changes during development, use:

   ```bash
   npm run prisma:migrate:dev --workspace server
   ```

5. Start the frontend and backend:

   ```bash
   npm run dev
   ```

## Local Tooling

- Start the bundled PostgreSQL container:

  ```bash
  npm run db:up
  ```

- Stop the bundled PostgreSQL container:

  ```bash
  npm run db:down
  ```

- Run an automated backend smoke test that creates a sample DOCX resume, registers a user, uploads the file, runs analysis, and verifies dashboard plus jobs endpoints:
  This also exercises email verification, refresh-token rotation, and password reset.
  The smoke test now uses an in-memory data store plus local fallbacks for mail, storage, AI, and jobs so it can run without Docker or third-party credentials.

  ```bash
  npm run smoke:test
  ```

- Run browser-level Playwright coverage for the landing page, protected-route redirect, and signup flow:
  The Playwright stack boots on dedicated test ports with the same in-memory/local fallback mode to avoid collisions with other local apps.

  ```bash
  npm run test:e2e
  ```

- Launch the containerized full stack:

  ```bash
  docker compose -f docker-compose.app.yml up --build
  ```

## Core Workflows

- Users register and authenticate with JWT-backed access tokens plus rotating refresh sessions.
- Email verification, password reset, and session revocation are built into the auth layer.
- Resumes are uploaded through the API, validated, and stored in Cloudinary.
- The backend extracts resume text from PDF or DOCX files and parses core sections.
- ATS scoring blends deterministic heuristics with optional OpenAI guidance.
- Job recommendations are fetched from JSearch using the strongest extracted skills.
- Each analysis is stored so the dashboard can show history and public share links.

## Notes

- OpenAI and RapidAPI integrations fail gracefully when keys are missing, so local UI development still works.
- When Cloudinary is not configured, resumes are stored locally under `server/uploads` and served back through the API in development.
- When RapidAPI JSearch is not configured, development mode generates clearly-labeled fallback job recommendations so the matching flow remains testable.
- When SMTP is not configured, verification and password-reset messages are written to `tmp/mail` for local preview instead of being discarded.
- The backend is the only place where third-party credentials are used.
- Share links expose report data only; authenticated routes remain protected by JWT middleware.
- The bundled Docker PostgreSQL service is mapped to `localhost:5433` to avoid conflicts with existing local PostgreSQL installations that often already use `5432`.
