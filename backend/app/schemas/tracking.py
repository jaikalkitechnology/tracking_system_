from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.shipment import ShipmentStatus


class TrackingEventCreate(BaseModel):
    status: ShipmentStatus
    title: str
    description: str | None = None
    location: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    event_time: datetime | None = None


class TrackingEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ShipmentStatus
    title: str
    description: str | None
    location: str | None
    latitude: float | None
    longitude: float | None
    event_time: datetime


class PublicTrackingResponse(BaseModel):
    tracking_number: str
    status: ShipmentStatus
    estimated_delivery: str | None
    origin: str | None
    destination: str | None
    events: list[TrackingEventResponse] = []
