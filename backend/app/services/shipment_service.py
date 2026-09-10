import random
import string
from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.shipment import Shipment, ShipmentStatus
from app.schemas.shipment import ShipmentCreate
from app.services.tracking_service import change_shipment_status


def generate_shipment_number(db: Session) -> str:
    date_part = datetime.now(timezone.utc).strftime("%Y%m%d")
    count = db.query(func.count(Shipment.id)).scalar() or 0
    return f"SHP-{date_part}-{count + 1:06d}"


def generate_tracking_number() -> str:
    rand_part = "".join(random.choices(string.digits, k=9))
    return f"TRK{rand_part}"


def create_shipment(db: Session, order: Order, payload: ShipmentCreate) -> Shipment:
    tracking_number = generate_tracking_number()
    while db.query(Shipment).filter(Shipment.tracking_number == tracking_number).first():
        tracking_number = generate_tracking_number()

    shipment = Shipment(
        shipment_number=generate_shipment_number(db),
        order_id=order.id,
        tracking_number=tracking_number,
        courier_id=payload.courier_id,
        warehouse_id=payload.warehouse_id,
        status=ShipmentStatus.ORDER_CONFIRMED,
        weight=payload.weight,
        shipping_cost=payload.shipping_cost,
        estimated_delivery_date=payload.estimated_delivery_date,
        origin=payload.origin,
        destination=payload.destination,
    )
    db.add(shipment)
    db.flush()

    change_shipment_status(
        db,
        shipment,
        ShipmentStatus.ORDER_CONFIRMED,
        description="Your order has been confirmed and is being prepared for shipping.",
    )
    return shipment
