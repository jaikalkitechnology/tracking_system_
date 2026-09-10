from sqlalchemy.orm import Session

from app.models.notification import Notification, NotificationType
from app.models.shipment import Shipment, ShipmentStatus

STATUS_TO_NOTIFICATION: dict[ShipmentStatus, NotificationType] = {
    ShipmentStatus.ORDER_CONFIRMED: NotificationType.ORDER_CONFIRMED,
    ShipmentStatus.PICKED_UP: NotificationType.SHIPMENT_PICKED_UP,
    ShipmentStatus.IN_TRANSIT: NotificationType.IN_TRANSIT,
    ShipmentStatus.OUT_FOR_DELIVERY: NotificationType.OUT_FOR_DELIVERY,
    ShipmentStatus.DELIVERED: NotificationType.DELIVERED,
    ShipmentStatus.DELIVERY_FAILED: NotificationType.DELIVERY_FAILED,
    ShipmentStatus.RETURN_REQUESTED: NotificationType.RETURN_STARTED,
}


def create_notification_for_shipment_event(db: Session, shipment: Shipment, title: str, message: str) -> Notification | None:
    notification_type = STATUS_TO_NOTIFICATION.get(shipment.status)
    if notification_type is None:
        return None

    order = shipment.order
    if order is None or order.customer is None or order.customer.user_id is None:
        return None

    notification = Notification(
        user_id=order.customer.user_id,
        shipment_id=shipment.id,
        type=notification_type,
        title=title,
        message=message,
        is_read=False,
    )
    db.add(notification)
    return notification
