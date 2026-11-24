# Triparna Ghosh — portfolio CMS

This repository contains a React/Vite portfolio and an Express/MongoDB API with JWT-protected admin editing and contact-message management.

## Run locally

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`, `JWT_SECRET`, and admin credentials.
2. Install dependencies: `npm install && npm run install:all`.
3. Seed the admin account and starter content: `npm run seed --prefix backend`.
4. Start both apps: `npm run dev`.

The public site is available at `http://localhost:5173`; the CMS is at `/admin`.

The public site falls back to starter content while the API is unavailable, but once MongoDB is running all portfolio content is fetched from the API.
