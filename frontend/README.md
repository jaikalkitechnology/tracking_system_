# Frontend — E-Commerce Tracking System

React + Vite + TypeScript + Tailwind CSS + Axios + React Router + Recharts.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL if the backend isn't on localhost:8000
```

## Run

```bash
npm run dev
```

Opens on http://localhost:5173. The backend must be running for the app to work — see `../backend/README.md`.

## Build

```bash
npm run build
npm run preview
```

## Structure

- `src/api` — Axios instance and one module per backend resource. Components never call `axios` directly.
- `src/pages` — route-level pages, grouped by feature.
- `src/components` — reusable `ui`, `layout`, `tables`, `tracking` and `charts` components.
- `src/context/AuthContext.tsx` — auth state, backed by localStorage tokens with automatic refresh on 401.
- `src/routes` — `AppRoutes.tsx` and `ProtectedRoute.tsx` (role-based route guards; the backend is still the source of truth for authorization).
