# Event Management System (API)
Lightweight role-based API for managing projects and team assignments. Built with Express and MongoDB, featuring JWT auth, rate limiting, and role guards. Project is work-in-progress.

## Features
- JWT access + refresh tokens with logout + rotation
- Role-based routes for ADMIN, LEAD, and DEVELOPER
- Project lifecycle: create, assign developers, mark complete, list by role
- Security middleware: Helmet, CORS, rate limiting
- MongoDB models for users and projects

## Tech Stack
- Node.js, Express
- MongoDB with Mongoose
- JWT (access + refresh)
- Helmet, CORS, express-rate-limit
- Nodemon for dev

## Project Structure
- server/src/app.js — Express app, middleware, route mounting
- server/src/config/db.js — Mongo connection helper
- server/src/routes — Route definitions (auth, projects)
- server/src/controllers — Request handlers
- server/src/middleware — Auth token + role guard
- server/src/models — Mongoose schemas (user, project)
- server/src/utils/token.utils.js — JWT helpers

## Prerequisites
- Node.js 18+
- MongoDB running locally or remotely
- npm

## Setup
1) Install deps
```bash
cd server
npm install
```
2) Create .env in server/ with
```bash
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
NODE_ENV=development
```
3) Seed an initial ADMIN user manually in the database (email + hashed password) or temporarily allow public register in code while bootstrapping.
4) Run dev server
```bash
npm run dev
```
Server listens on port 5000 by default.

## Roles & Permissions
- ADMIN: create users, create projects, mark projects complete
- LEAD: assign developers to their own projects, view projects they lead
- DEVELOPER: view projects they are assigned to

## Authentication Flow
- Login with email/password → receive accessToken (15m) + refreshToken (7d)
- Send `Authorization: Bearer <accessToken>` on protected routes
- Use `/api/auth/refresh` to rotate tokens before access expiry
- `/api/auth/logout` clears stored refresh token server-side

## API Reference (WIP)

Auth (base: /api/auth)
- POST /register (ADMIN) — create user `{ name, email, password, role }`
- POST /login — `{ email, password }` → `{ accessToken, refreshToken, role }`
- POST /refresh — `{ refreshToken }` → rotated tokens
- POST /logout — revoke current user refresh token

Projects (base: /api/projects)
- POST / (ADMIN) — create project `{ name, description, deadline, leadEmail }`
- PATCH /:id/assign (LEAD) — assign developer by email `{ developerEmail }`
- PATCH /:id/complete (ADMIN) — mark completed
- GET / (AUTH) — list projects filtered by role (ADMIN all, LEAD theirs, DEVELOPER assigned)

### Example: Login then fetch projects
```bash
curl -X POST http://localhost:5000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"lead@example.com","password":"secret"}'

curl http://localhost:5000/api/projects \
	-H "Authorization: Bearer <accessToken>"
```

### Example: ADMIN creates a project
```bash
curl -X POST http://localhost:5000/api/projects \
	-H "Authorization: Bearer <adminAccessToken>" \
	-H "Content-Type: application/json" \
	-d '{
		"name":"Venue Launch",
		"description":"Prep for launch week",
		"deadline":"2025-12-01",
		"leadEmail":"lead@example.com"
	}'
```

## Data Models
- User: `name`, `email (unique)`, `password (hashed)`, `role (ADMIN|LEAD|DEVELOPER)`, `refreshToken`
- Project: `name`, `description`, `deadline`, `status (ACTIVE|COMPLETED)`, `lead (User ref)`, `developers [User refs]`

## Notes / TODO
- Add user routes (currently unused placeholder)
- Add validation and error handling around missing users/emails
- Add tests and CI
- Consider using env var for port and enabling HTTPS behind a proxy

