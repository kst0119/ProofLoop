# ProofLoop

ProofLoop is a React/Vite coding-assessment client backed by an Express API and PostgreSQL evidence store.

## Run locally

Requirements: Node.js, PostgreSQL, and a reachable Judge0 endpoint. The backend uses `DATABASE_URL`; the client only needs the public API URL.

1. In `server/`, copy `.env.example` to `.env` and set `DATABASE_URL` for your local PostgreSQL database. The example selects the backend's mock AI mode. To use a real AI provider, set `AI_COACH_MODE=real` and `OPENAI_API_KEY` in this backend-only file. Do not commit `.env` or provider credentials.
2. Install backend dependencies with `npm ci`, generate Prisma Client with `npx prisma generate`, apply the checked-in Prisma migrations with `npx prisma migrate deploy`, then start the API with `npm run dev`. The default URL is `http://localhost:3001`.
3. In `client/`, copy `.env.example` to `.env.local` if using a different API URL. Install dependencies with `npm ci` and start the Vite app with `npm run dev`.

The frontend defaults to `http://localhost:3001` when `VITE_API_BASE_URL` is unset. Browser-visible `VITE_` variables must never contain secrets. The backend currently enables CORS for local development; production deployment needs a restricted origin and authentication/authorization for session evidence and reports.

## Checks

- Client build: `cd client && npm run build`
- Client lint: `cd client && npm run lint`
- Backend typecheck: `cd server && npm run typecheck`
- Backend tests: `cd server && npm test`
- Backend health: `curl http://localhost:3001/api/health`

The assessment task and visible tests come from the API. Code execution, AI Coach responses, final submission, evidence, and reports are API-backed. Judge0/AI provider mode depends on backend configuration. Assessment expiry is displayed from the session start time but is not enforced by the current backend.
