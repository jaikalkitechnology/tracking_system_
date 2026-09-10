# Backend — E-Commerce Tracking System API

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
