from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AddressBase(BaseModel):
    address_line1: str
    address_line2: str | None = None
    city: str
    state: str
    pincode: str
    country: str = "India"
    latitude: float | None = None
    longitude: float | None = None


class AddressCreate(AddressBase):
    customer_id: int


class AddressUpdate(BaseModel):
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class AddressResponse(AddressBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    created_at: datetime
    updated_at: datetime
