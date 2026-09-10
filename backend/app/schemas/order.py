from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus, PaymentStatus
from app.schemas.address import AddressResponse
from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    price: float
    total: float
    product: ProductResponse | None = None


class OrderCreate(BaseModel):
    customer_id: int
    shipping_address_id: int | None = None
    billing_address_id: int | None = None
    items: list[OrderItemCreate]


class OrderUpdate(BaseModel):
    payment_status: PaymentStatus | None = None
    order_status: OrderStatus | None = None
    shipping_address_id: int | None = None
    billing_address_id: int | None = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    customer_id: int
    total_amount: float
    payment_status: PaymentStatus
    order_status: OrderStatus
    shipping_address_id: int | None
    billing_address_id: int | None
    created_at: datetime
    updated_at: datetime


class OrderDetailResponse(OrderResponse):
    customer: CustomerResponse | None = None
    shipping_address: AddressResponse | None = None
    billing_address: AddressResponse | None = None
    items: list[OrderItemResponse] = []
