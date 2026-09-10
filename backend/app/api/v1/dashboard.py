from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.permissions import require_staff
from app.database.database import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.order import OrderResponse
from app.schemas.shipment import ShipmentResponse
from app.services.dashboard_service import get_recent_orders, get_recent_shipments, get_shipment_statistics, get_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return get_summary(db)


@router.get("/shipment-statistics")
def shipment_statistics(db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return get_shipment_statistics(db)


@router.get("/orders-over-time")
def orders_over_time(days: int = 14, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(func.date(Order.created_at), func.count(Order.id))
        .filter(Order.created_at >= since)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )
    return [{"date": str(day), "count": count} for day, count in rows]


@router.get("/recent-orders", response_model=list[OrderResponse])
def recent_orders(limit: int = 10, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return get_recent_orders(db, limit)


@router.get("/recent-shipments", response_model=list[ShipmentResponse])
def recent_shipments(limit: int = 10, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return get_recent_shipments(db, limit)
