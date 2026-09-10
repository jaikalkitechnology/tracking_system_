from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import (
    addresses,
    auth,
    couriers,
    customers,
    dashboard,
    notifications,
    orders,
    products,
    shipments,
    tracking,
    users,
    warehouses,
    webhooks,
)
from app.core.config import settings
from app.utils.response import AppError, app_error_handler, http_exception_handler, validation_exception_handler

app = FastAPI(
    title=settings.APP_NAME,
    description="Admin dashboard and customer-facing API for tracking e-commerce orders and shipments end to end.",
    version="1.0.0",
    openapi_tags=[
        {"name": "Authentication", "description": "Register, login, refresh and session endpoints."},
        {"name": "Users", "description": "User management (admin only)."},
        {"name": "Customers", "description": "Customer management."},
        {"name": "Addresses", "description": "Customer shipping/billing addresses."},
        {"name": "Products", "description": "Product catalog."},
        {"name": "Orders", "description": "Order management."},
        {"name": "Shipments", "description": "Shipment management and status updates."},
        {"name": "Public Tracking", "description": "Public, unauthenticated tracking lookup."},
        {"name": "Couriers", "description": "Delivery partner management."},
        {"name": "Warehouses", "description": "Warehouse management."},
        {"name": "Notifications", "description": "User notifications."},
        {"name": "Dashboard", "description": "Aggregated statistics for the admin dashboard."},
        {"name": "Webhooks", "description": "Inbound courier status update webhooks."},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(customers.router, prefix=API_PREFIX)
app.include_router(addresses.router, prefix=API_PREFIX)
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(orders.router, prefix=API_PREFIX)
app.include_router(shipments.router, prefix=API_PREFIX)
app.include_router(tracking.router, prefix=API_PREFIX)
app.include_router(couriers.router, prefix=API_PREFIX)
app.include_router(warehouses.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(webhooks.router, prefix=API_PREFIX)


@app.get("/", tags=["Health"])
def root():
    return {"success": True, "message": f"{settings.APP_NAME} API", "docs": "/docs"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
