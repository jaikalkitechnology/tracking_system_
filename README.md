# Vastraliya Tracking System

A full-stack order & shipment tracking platform: an admin dashboard for staff and a public tracking page + customer portal, backed by a FastAPI + MySQL API.

## Overview

- **Admin Dashboard** — orders, shipments, customers, products, couriers, warehouses, notifications, and analytics, gated by role.
- **Customer Portal** — customers sign in to see their own orders, shipment status, and notifications.
- **Public Tracking Page** (`/track`) — anyone can look up a shipment by tracking number, no login required.

Every shipment status change is recorded as an immutable `tracking_events` row (never just overwritten), which is what powers both the admin tracking timeline and the public tracking page.

## Architecture

```
React (Vite/TS) --Axios--> FastAPI --SQLAlchemy--> MySQL 8
```

- **Backend**: Python 3 / FastAPI / SQLAlchemy / Alembic / Pydantic / JWT (`python-jose`) / Passlib(bcrypt).
- **Frontend**: React 18 / Vite / TypeScript / Tailwind CSS / Axios / React Router / Recharts.
- **Database**: MySQL 8 (`ecommerce_tracking`).

No PostgreSQL, no TanStack Query/React Query, no Redux, no mobile or courier app — per project requirements.

```
ecommerce-tracking-system/
├── backend/    # FastAPI service (see backend/README.md)
├── frontend/   # React admin + customer + public tracking app (see frontend/README.md)
├── docker-compose.yml
└── README.md
```

## Requirements

- Python 3.11+
- Node.js 20+
- MySQL 8 (or Docker)

## Quick start (Docker)

```bash
cp .env.example .env   # optional: override MySQL/JWT defaults
docker compose up --build
```

This starts MySQL on `3306`, the API on `8000`, and the frontend dev server on `5173`. Run migrations and seed data once the containers are up:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.seed
```

## Quick start (local, no Docker)

**1. MySQL**

```sql
CREATE DATABASE ecommerce_tracking;
```

**2. Backend**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # point DATABASE_URL at your MySQL instance
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

**3. Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit http://localhost:5173. API docs are at http://localhost:8000/docs.

## Environment variables

See `backend/.env.example` and `frontend/.env.example`. Never commit real `.env` files — `DATABASE_URL` credentials, `JWT_SECRET`, and courier `api_key` values must stay server-side and out of version control.

## Seed data / demo logins

`python -m app.seed` (from `backend/`) creates one account per role, all with password `Password@123`:

| Role | Email |
|---|---|
| SUPER_ADMIN | superadmin@example.com |
| ADMIN | admin@example.com |
| MANAGER | manager@example.com |
| WAREHOUSE | warehouse@example.com |
| CUSTOMER | customer@example.com |

It also creates a sample order with a shipment that already has a multi-step tracking history, so you can immediately try `/track` with the tracking number printed by the script.

## Authentication

JWT access + refresh tokens (`POST /api/v1/auth/login`, `/auth/refresh`). Passwords are hashed with bcrypt and never stored or returned in plaintext. The frontend stores tokens in `localStorage` and transparently refreshes on a 401 via an Axios interceptor.

## Roles & permissions

| Role | Access |
|---|---|
| SUPER_ADMIN | Everything, including user management |
| ADMIN | Orders, shipments, customers, products, couriers, warehouses, reports |
| MANAGER | Orders, shipments, customers, reports |
| WAREHOUSE | Orders, shipments, warehouse operations |
| CUSTOMER | Their own orders, shipments, and notifications only |

Permissions are enforced in the API (`app/core/permissions.py`) — the frontend's route guards are a UX convenience only, never the source of truth.

## Integrating from another website

Want a different e-commerce site to pull order or tracking data from this
API? See [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md) for the auth
flow, the order-lookup endpoints, and the public tracking endpoint.

## Core end-to-end flow

1. Admin creates an order (`POST /api/v1/orders`).
2. Admin creates a shipment for that order (`POST /api/v1/shipments`) — a tracking number and shipment number are generated, and an `ORDER_CONFIRMED` tracking event is recorded automatically.
3. Admin updates the shipment status (`POST /api/v1/shipments/{id}/status`) as it moves through the courier network — each update writes a new `tracking_events` row and creates a customer notification.
4. A customer (or anyone) opens `/track`, enters the tracking number, and sees the live status and full timeline via the public, unauthenticated `GET /api/v1/track/{tracking_number}` endpoint.

## Deployment

Backend and frontend are independently deployable:

- **Backend**: run `alembic upgrade head` then serve `app.main:app` with a production ASGI server (e.g. `uvicorn`/`gunicorn` behind a reverse proxy). Set `APP_ENV=production`, a strong `JWT_SECRET`, and a production `DATABASE_URL`.
- **Frontend**: `npm run build` produces a static `dist/` bundle servable from any static host or CDN; point `VITE_API_BASE_URL` at the deployed backend.

## Project structure

See `backend/README.md` and `frontend/README.md` for the detailed structure of each app.
