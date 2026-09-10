from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.shipment import Shipment, ShipmentStatus
from app.models.tracking_event import TrackingEvent
from app.services.notification_service import create_notification_for_shipment_event

STATUS_TITLES: dict[ShipmentStatus, str] = {
    ShipmentStatus.ORDER_CONFIRMED: "Order Confirmed",
    ShipmentStatus.PACKED: "Packed",
    ShipmentStatus.READY_FOR_PICKUP: "Ready for Pickup",
    ShipmentStatus.PICKED_UP: "Picked Up",
    ShipmentStatus.IN_TRANSIT: "In Transit",
    ShipmentStatus.ARRIVED_AT_HUB: "Arrived at Hub",
    ShipmentStatus.OUT_FOR_DELIVERY: "Out for Delivery",
    ShipmentStatus.DELIVERED: "Delivered",
    ShipmentStatus.DELIVERY_FAILED: "Delivery Failed",
    ShipmentStatus.CANCELLED: "Cancelled",
    ShipmentStatus.RETURN_REQUESTED: "Return Requested",
    ShipmentStatus.RETURNED: "Returned",
    ShipmentStatus.RTO: "Return to Origin",
    ShipmentStatus.ON_HOLD: "On Hold",
}


def change_shipment_status(
    db: Session,
    shipment: Shipment,
    new_status: ShipmentStatus,
    title: str | None = None,
    description: str | None = None,
    location: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    event_time: datetime | None = None,
) -> TrackingEvent:
    """Update shipment status, record a tracking event, and notify the customer."""
    event_title = title or STATUS_TITLES.get(new_status, new_status.value.replace("_", " ").title())
    resolved_time = event_time or datetime.now(timezone.utc)

    shipment.status = new_status
    if new_status == ShipmentStatus.DELIVERED:
        shipment.actual_delivery_date = resolved_time.date()

    event = TrackingEvent(
        shipment_id=shipment.id,
        status=new_status,
        title=event_title,
        description=description,
        location=location,
        latitude=latitude,
        longitude=longitude,
        event_time=resolved_time,
    )
    db.add(event)
    db.flush()

    create_notification_for_shipment_event(
        db,
        shipment,
        title=event_title,
        message=description or f"Your shipment {shipment.tracking_number} is now {event_title}.",
    )

    db.commit()
    db.refresh(shipment)
    return event
