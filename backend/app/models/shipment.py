import enum
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin


class ShipmentStatus(str, enum.Enum):
    ORDER_CONFIRMED = "ORDER_CONFIRMED"
    PACKED = "PACKED"
    READY_FOR_PICKUP = "READY_FOR_PICKUP"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    ARRIVED_AT_HUB = "ARRIVED_AT_HUB"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    DELIVERY_FAILED = "DELIVERY_FAILED"
    CANCELLED = "CANCELLED"
    RETURN_REQUESTED = "RETURN_REQUESTED"
    RETURNED = "RETURNED"
    RTO = "RTO"
    ON_HOLD = "ON_HOLD"


class Shipment(TimestampMixin, Base):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True)
    shipment_number: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), index=True, nullable=False)
    tracking_number: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    courier_id: Mapped[int | None] = mapped_column(ForeignKey("delivery_partners.id"), nullable=True)
    warehouse_id: Mapped[int | None] = mapped_column(ForeignKey("warehouses.id"), nullable=True)
    status: Mapped[ShipmentStatus] = mapped_column(Enum(ShipmentStatus), default=ShipmentStatus.ORDER_CONFIRMED, nullable=False, index=True)
    weight: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    shipping_cost: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    pickup_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    estimated_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    origin: Mapped[str | None] = mapped_column(String(150), nullable=True)
    destination: Mapped[str | None] = mapped_column(String(150), nullable=True)

    order = relationship("Order", back_populates="shipments")
    courier = relationship("Courier", back_populates="shipments")
    warehouse = relationship("Warehouse", back_populates="shipments")
    tracking_events = relationship(
        "TrackingEvent", back_populates="shipment", cascade="all, delete-orphan", order_by="TrackingEvent.event_time"
    )
    notifications = relationship("Notification", back_populates="shipment")
