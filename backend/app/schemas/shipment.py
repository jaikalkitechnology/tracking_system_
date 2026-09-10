from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.shipment import ShipmentStatus
from app.schemas.courier import CourierResponse
from app.schemas.tracking import TrackingEventResponse
from app.schemas.warehouse import WarehouseResponse


class ShipmentCreate(BaseModel):
    order_id: int
    courier_id: int | None = None
    warehouse_id: int | None = None
    weight: float | None = None
    shipping_cost: float | None = None
    estimated_delivery_date: date | None = None
    origin: str | None = None
    destination: str | None = None


class ShipmentStatusUpdate(BaseModel):
    status: ShipmentStatus
    title: str | None = None
    description: str | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class ShipmentUpdate(BaseModel):
    courier_id: int | None = None
    warehouse_id: int | None = None
    weight: float | None = None
    shipping_cost: float | None = None
    pickup_date: date | None = None
    estimated_delivery_date: date | None = None
    origin: str | None = None
    destination: str | None = None


class ShipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    shipment_number: str
    order_id: int
    tracking_number: str
    courier_id: int | None
    warehouse_id: int | None
    status: ShipmentStatus
    weight: float | None
    shipping_cost: float | None
    pickup_date: date | None
    estimated_delivery_date: date | None
    actual_delivery_date: date | None
    origin: str | None
    destination: str | None
    created_at: datetime
    updated_at: datetime


class ShipmentDetailResponse(ShipmentResponse):
    courier: CourierResponse | None = None
    warehouse: WarehouseResponse | None = None
    tracking_events: list[TrackingEventResponse] = []
