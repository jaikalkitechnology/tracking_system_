from sqlalchemy.orm import Session

from app.core.permissions import STAFF_ROLES
from app.models.notification import Notification, NotificationType
from app.models.order import Order
from app.models.shipment import Shipment, ShipmentStatus
from app.models.user import User

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


def create_notifications_for_new_order(db: Session, order: Order) -> None:
    """Notifies every staff user (admin/manager/warehouse) that a new order came in."""
    staff_ids = db.query(User.id).filter(User.role.in_(STAFF_ROLES)).all()
    if not staff_ids:
        return

    customer_name = order.customer.name if order.customer else "A customer"
    message = f"{customer_name} placed order {order.order_number} for ₹{float(order.total_amount):.2f}."

    for (staff_id,) in staff_ids:
        db.add(
            Notification(
                user_id=staff_id,
                shipment_id=None,
                type=NotificationType.NEW_ORDER,
                title="New Order",
                message=message,
                is_read=False,
            )
        )
