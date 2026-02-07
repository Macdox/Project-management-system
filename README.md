# Event Management System (API + Frontend)
Role-based project management with document uploads. Backend: Express + MongoDB with JWT auth/refresh, rate limiting, and role guards. Frontend: React + Bootstrap with protected routes and admin tooling.

## Features
- JWT access + refresh tokens with logout + rotation
- Role-based dashboards for ADMIN, LEAD, DEVELOPER
- Projects: create/update/delete, mark complete, assign lead, assign developer, list by role
- Documents: upload per project (PDF/DOC/DOCX/PNG/JPG), served from `/uploads`
- Users (ADMIN): create users, edit user role, list all users
- Security middleware: Helmet, CORS, rate limiting
- Frontend: protected routes, token refresh interceptor, project CRUD, doc upload, user admin

## Tech Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Multer
- Frontend: React, React Router, Axios, Zustand, Bootstrap

## Project Structure
- server/src/app.js — Express app, middleware, routes, serves `/uploads`
- server/src/config/db.js — Mongo connection helper
- server/src/routes — auth, projects, users
- server/src/controllers — handlers for auth, projects, users
- server/src/middleware — auth token + role guard
- server/src/models — user, project (with documents[])
- server/src/utils/token.utils.js — JWT helpers
- Frontend/my-app/src — React app (Login, Dashboard, Admin tools, ProtectedRoute, API client)

## Backend Setup
1) Install deps
```bash
cd server
npm install
```
2) Create .env in server/
```bash
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```
3) Seed an initial ADMIN user manually (email + hashed password) or temporarily allow public register while bootstrapping.
4) Run dev server
```bash
npm run dev
```
Server listens on port 5000 by default and serves uploads from `/uploads`. Set `CLIENT_URL` (comma-separated) to whitelist frontends for CORS.

## Frontend Setup
```bash
cd Frontend/my-app
npm install
npm start
```
App starts at http://localhost:3000. Backend base URL defaults to http://localhost:5000/api; override with `BACKEND_URL` env if needed.

## Roles & Permissions
- ADMIN: create users, edit roles, list users, create/update/delete projects, mark complete, upload documents
- LEAD: view/update own projects, assign developers, upload documents
- DEVELOPER: view assigned projects, upload documents

## Authentication Flow
- Login → receive `accessToken` (15m) + `refreshToken` (7d)
- Send `Authorization: Bearer <accessToken>` on protected routes
- Client auto-refreshes on 401 via `/api/auth/refresh`
- `/api/auth/check` validates access token (used by frontend guard)
- `/api/auth/logout` revokes refresh token server-side

## API Reference

Auth (base: /api/auth)
- POST /register (ADMIN) — `{ name, email, password, role }`
- POST /login — `{ email, password }` → `{ accessToken, refreshToken, role, user }`
- POST /refresh — `{ refreshToken }` → rotated tokens
- POST /logout — revoke current user refresh token
- GET /check — validate access token, returns user

Users (base: /api/users)
- GET / (ADMIN) — list all users (password/refresh omitted)

Projects (base: /api/projects)
- POST / (ADMIN) — create project `{ name, description, deadline, leadEmail }`
- PATCH /:id/update (ADMIN/Lead-owner) — update project fields
- DELETE /:id/delete (ADMIN) — delete project
- PATCH /:id/complete (ADMIN) — mark completed
- PATCH /:id/assign (LEAD) — assign developer by email `{ developerEmail }`
- POST /:id/documents (AUTH) — upload document (field `document` or `file`), roles: admin/lead/dev on that project
- GET / (AUTH) — list projects filtered by role (ADMIN all, LEAD theirs, DEVELOPER assigned)

## Data Models
- User: `name`, `email (unique)`, `password (hashed)`, `role (ADMIN|LEAD|DEVELOPER)`, `refreshToken`
- Project: `name`, `description`, `deadline`, `status (ACTIVE|COMPLETED)`, `lead (User ref)`, `developers [User refs]`, `documents[] { filename, originalName, mimeType, size, uploadedBy, uploadedAt }`

## Example Calls
### Login then fetch projects
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"lead@example.com","password":"secret"}'

curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer <accessToken>"
```

### Upload a document to a project
```bash
curl -X POST http://localhost:5000/api/projects/<projectId>/documents \
  -H "Authorization: Bearer <token>" \
  -F "document=@/path/to/file.pdf"
```

## Notes / TODO
- Harden validation and error handling around emails and ownership
- Add tests and CI
- Consider env var for port and enabling HTTPS behind a proxy
