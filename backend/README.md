# Backend — Vastraliya Tracking System API

FastAPI + SQLAlchemy + MySQL 8 + Alembic + JWT.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then edit DATABASE_URL / JWT_SECRET
```

Make sure MySQL 8 is running and the database in `DATABASE_URL` exists:

```sql
CREATE DATABASE ecommerce_tracking;
```

### Connecting to your own MySQL instance

`DATABASE_URL` lives only in `backend/.env` (gitignored — never commit it or hardcode it in `app/database/database.py`). Point it at your MySQL server:

```env
DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:<port>/ecommerce_tracking
```

- Local default install: `mysql+pymysql://root:password@localhost:3306/ecommerce_tracking`
- Docker Compose (`docker-compose.yml` in the repo root): `mysql+pymysql://root:${MYSQL_ROOT_PASSWORD}@mysql:3306/${MYSQL_DATABASE}` — the `mysql` service is already reachable by that hostname from the `backend` container.
- A remote/managed MySQL instance: use its host, port, and credentials as provided; add `?ssl_mode=REQUIRED` (or your provider's equivalent) if it requires TLS.

`app/core/config.py` reads `DATABASE_URL` from the environment at startup and `app/database/database.py` builds the SQLAlchemy engine from it — no code changes are needed to switch databases, only the `.env` value.

## Migrations

```bash
alembic upgrade head
```

To create a new migration after changing models:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Seed data

```bash
python -m app.seed
```

Creates one user per role (password `Password@123` for all), sample products, a warehouse, a courier, a customer with an order, and a shipment with a full tracking history.

## Run

```bash
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs (Swagger) and http://localhost:8000/redoc.

## Tests

```bash
pytest
```
