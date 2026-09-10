from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.courier import CourierStatus


class CourierBase(BaseModel):
    name: str
    code: str
    phone: str | None = None
    email: EmailStr | None = None
    api_url: str | None = None


class CourierCreate(CourierBase):
    api_key: str | None = None
    status: CourierStatus = CourierStatus.ACTIVE


class CourierUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    api_url: str | None = None
    api_key: str | None = None
    status: CourierStatus | None = None


class CourierResponse(CourierBase):
    """API key is intentionally excluded from responses."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    status: CourierStatus
    created_at: datetime
    updated_at: datetime
