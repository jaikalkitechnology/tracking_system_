from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.shipment import Shipment, ShipmentStatus


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
    }


def get_shipment_statistics(db: Session) -> list[dict]:
    rows = db.query(Shipment.status, func.count(Shipment.id)).group_by(Shipment.status).all()
    return [{"status": status.value, "count": count} for status, count in rows]


def get_recent_orders(db: Session, limit: int = 10) -> list[Order]:
    return db.query(Order).order_by(Order.created_at.desc()).limit(limit).all()


def get_recent_shipments(db: Session, limit: int = 10) -> list[Shipment]:
    return db.query(Shipment).order_by(Shipment.created_at.desc()).limit(limit).all()
