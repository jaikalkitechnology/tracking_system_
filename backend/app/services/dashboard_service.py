from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.shipment import Shipment, ShipmentStatus
from app.models.tracking_event import TrackingEvent


def compute_trend(current: float, previous: float) -> float:
    """Percent change of current vs previous. 0 vs 0 is 0%; 0 -> N is treated as 100%."""
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 1)


def _window(days: int) -> tuple[datetime, datetime, datetime]:
    now = datetime.now(timezone.utc)
    current_start = now - timedelta(days=days)
    previous_start = now - timedelta(days=days * 2)
    return previous_start, current_start, now


def get_summary(db: Session) -> dict:
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_shipments = db.query(func.count(Shipment.id)).scalar() or 0

    def count_status(status: ShipmentStatus) -> int:
        return db.query(func.count(Shipment.id)).filter(Shipment.status == status).scalar() or 0

    pending = count_status(ShipmentStatus.ORDER_CONFIRMED) + count_status(ShipmentStatus.PACKED)
    picked_up = count_status(ShipmentStatus.PICKED_UP)
    in_transit = count_status(ShipmentStatus.IN_TRANSIT) + count_status(ShipmentStatus.ARRIVED_AT_HUB)
    out_for_delivery = count_status(ShipmentStatus.OUT_FOR_DELIVERY)
    delivered = count_status(ShipmentStatus.DELIVERED)
    failed = count_status(ShipmentStatus.DELIVERY_FAILED)
    returns = (
        count_status(ShipmentStatus.RETURN_REQUESTED)
        + count_status(ShipmentStatus.RETURNED)
        + count_status(ShipmentStatus.RTO)
    )

    previous_start, current_start, now = _window(7)

    def period_count_orders(start: datetime, end: datetime) -> int:
        return (
            db.query(func.count(Order.id)).filter(Order.created_at >= start, Order.created_at < end).scalar() or 0
        )

    def period_count_shipments(start: datetime, end: datetime) -> int:
        return (
            db.query(func.count(Shipment.id)).filter(Shipment.created_at >= start, Shipment.created_at < end).scalar()
            or 0
        )

    def period_event_count(status: ShipmentStatus, start: datetime, end: datetime) -> int:
        return (
            db.query(func.count(TrackingEvent.id))
            .filter(TrackingEvent.status == status, TrackingEvent.event_time >= start, TrackingEvent.event_time < end)
            .scalar()
            or 0
        )

    orders_this_week = period_count_orders(current_start, now)
    orders_prior_week = period_count_orders(previous_start, current_start)

    shipments_this_week = period_count_shipments(current_start, now)
    shipments_prior_week = period_count_shipments(previous_start, current_start)

    in_transit_this_week = period_event_count(ShipmentStatus.IN_TRANSIT, current_start, now)
    in_transit_prior_week = period_event_count(ShipmentStatus.IN_TRANSIT, previous_start, current_start)

    delivered_this_week = period_event_count(ShipmentStatus.DELIVERED, current_start, now)
    delivered_prior_week = period_event_count(ShipmentStatus.DELIVERED, previous_start, current_start)

    failed_this_week = period_event_count(ShipmentStatus.DELIVERY_FAILED, current_start, now)
    failed_prior_week = period_event_count(ShipmentStatus.DELIVERY_FAILED, previous_start, current_start)

    return {
        "total_orders": total_orders,
        "total_shipments": total_shipments,
        "pending": pending,
        "picked_up": picked_up,
        "in_transit": in_transit,
        "out_for_delivery": out_for_delivery,
        "delivered": delivered,
        "failed_deliveries": failed,
        "returns": returns,
        "total_orders_trend": compute_trend(orders_this_week, orders_prior_week),
        "total_shipments_trend": compute_trend(shipments_this_week, shipments_prior_week),
        "in_transit_trend": compute_trend(in_transit_this_week, in_transit_prior_week),
        "delivered_trend": compute_trend(delivered_this_week, delivered_prior_week),
        "failed_deliveries_trend": compute_trend(failed_this_week, failed_prior_week),
    }


def get_shipment_statistics(db: Session) -> list[dict]:
    rows = db.query(Shipment.status, func.count(Shipment.id)).group_by(Shipment.status).all()
    return [{"status": status.value, "count": count} for status, count in rows]


def get_recent_orders(db: Session, limit: int = 10) -> list[Order]:
    return db.query(Order).order_by(Order.created_at.desc()).limit(limit).all()


def get_recent_shipments(db: Session, limit: int = 10) -> list[Shipment]:
    return db.query(Shipment).order_by(Shipment.created_at.desc()).limit(limit).all()


def get_recent_activity(db: Session, limit: int = 10) -> list[TrackingEvent]:
    return (
        db.query(TrackingEvent)
        .join(Shipment, TrackingEvent.shipment_id == Shipment.id)
        .order_by(TrackingEvent.event_time.desc())
        .limit(limit)
        .all()
    )
