from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.warehouse import WarehouseStatus


class WarehouseBase(BaseModel):
    name: str
    code: str
    address: str | None = None
    city: str
    state: str
    pincode: str
    latitude: float | None = None
    longitude: float | None = None


class WarehouseCreate(WarehouseBase):
    status: WarehouseStatus = WarehouseStatus.ACTIVE


class WarehouseUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    status: WarehouseStatus | None = None


class WarehouseResponse(WarehouseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: WarehouseStatus
    created_at: datetime
    updated_at: datetime
