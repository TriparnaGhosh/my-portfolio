# Triparna Ghosh — portfolio CMS

This repository contains a React/Vite portfolio and an Express/MongoDB API with JWT-protected admin editing and contact-message management.

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, `JWT_SECRET`, and admin credentials.
2. Install dependencies: `npm install && npm run install:all`.
3. Seed the admin account and starter content: `npm run seed --prefix backend`. Seeding does not overwrite existing portfolio edits; it upgrades the original starter collections once.
4. Start both apps: `npm run dev`.

The public site is available at `http://localhost:5173`; the CMS is at `/admin`.

The public site falls back to starter content while the API is unavailable, but once MongoDB is running all portfolio content is fetched from the API.

## Deploy

Deploy the backend and frontend as separate services, or place them behind a reverse proxy that routes `/api` to the backend.

### Backend

Run the Node 18+ service from `backend/` with `npm ci` and `npm start`. Configure these environment variables in the hosting provider:

- `MONGODB_URI`: production MongoDB connection string.
- `JWT_SECRET`: a randomly generated secret with at least 32 characters.
- `CLIENT_URL`: exact frontend origin, or comma-separated origins if there are multiple.
- `PORT`: supplied by most hosting providers.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`: required for media and resume uploads.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: set securely when running `npm run seed --prefix backend` to create the admin account; the password must be at least 12 characters.

The backend exposes `/health` for service health checks. The API requires MongoDB and a JWT secret at startup, and requires `CLIENT_URL` in production.

### Frontend

Set `VITE_API_URL` to the deployed API base URL ending in `/api` before building (for example, `https://api.example.com/api`), then run `npm run build --prefix frontend`. Publish `frontend/dist` as a static site and configure the host to serve `index.html` for SPA routes such as `/admin`.

For a same-origin reverse proxy, `VITE_API_URL=/api` is sufficient. `frontend/.env.example` contains the local development value.

Do not commit `.env` files. The checked-in `.env.example` files contain placeholders only. Rotate any credentials that may have been committed previously; removing a file from the current revision does not remove it from Git history.
