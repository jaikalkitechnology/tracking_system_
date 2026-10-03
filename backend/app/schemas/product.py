from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.product import ProductStatus


class ProductImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


class ProductBase(BaseModel):
    sku: str
    name: str
    description: str | None = None
    category: str | None = None
    brand: str | None = None
    image_url: str | None = None
    barcode: str | None = None
    tags: str | None = None
    price: float
    compare_price: float | None = None
    cost_price: float | None = None
    weight: float | None = None
    length_cm: float | None = None
    width_cm: float | None = None
    height_cm: float | None = None
    stock_quantity: int = 0
    low_stock_threshold: int = 5


class ProductCreate(ProductBase):
    status: ProductStatus = ProductStatus.ACTIVE


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    brand: str | None = None
    image_url: str | None = None
    barcode: str | None = None
    tags: str | None = None
    price: float | None = None
    compare_price: float | None = None
    cost_price: float | None = None
    weight: float | None = None
    length_cm: float | None = None
    width_cm: float | None = None
    height_cm: float | None = None
    stock_quantity: int | None = None
    low_stock_threshold: int | None = None
    status: ProductStatus | None = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ProductStatus
    stock_status: str
    images: list[ProductImageResponse] = []
    created_at: datetime
    updated_at: datetime


class ProductImageCreate(BaseModel):
    url: str
    position: int = 0
