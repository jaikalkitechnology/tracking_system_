from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.order import OrderStatus, PaymentMethod, PaymentStatus
from app.models.shipment import ShipmentStatus
from app.schemas.address import AddressResponse
from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse


class OrderCreatorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class OrderShipmentSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    shipment_number: str
    tracking_number: str
    status: ShipmentStatus


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
    payment_method: PaymentMethod = PaymentMethod.ONLINE
    items: list[OrderItemCreate]


class OrderUpdate(BaseModel):
    payment_status: PaymentStatus | None = None
    payment_method: PaymentMethod | None = None
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
    payment_method: PaymentMethod
    order_status: OrderStatus
    shipping_address_id: int | None
    billing_address_id: int | None
    created_by: OrderCreatorResponse | None = None
    created_at: datetime
    updated_at: datetime


class OrderDetailResponse(OrderResponse):
    customer: CustomerResponse | None = None
    shipping_address: AddressResponse | None = None
    billing_address: AddressResponse | None = None
    items: list[OrderItemResponse] = []
    shipments: list[OrderShipmentSummary] = []
