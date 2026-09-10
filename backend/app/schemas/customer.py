from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.customer import CustomerStatus
from app.schemas.address import AddressResponse


class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None


class CustomerCreate(CustomerBase):
    user_id: int | None = None


class CustomerUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    status: CustomerStatus | None = None


class CustomerResponse(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_code: str
    status: CustomerStatus
    created_at: datetime
    updated_at: datetime


class CustomerDetailResponse(CustomerResponse):
    addresses: list[AddressResponse] = []
