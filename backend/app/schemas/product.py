from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.product import ProductStatus


class ProductBase(BaseModel):
    sku: str
    name: str
    description: str | None = None
    category: str | None = None
    image_url: str | None = None
    price: float
    weight: float | None = None
    stock_quantity: int = 0
    low_stock_threshold: int = 5


class ProductCreate(ProductBase):
    status: ProductStatus = ProductStatus.ACTIVE


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    image_url: str | None = None
    price: float | None = None
    weight: float | None = None
    stock_quantity: int | None = None
    low_stock_threshold: int | None = None
    status: ProductStatus | None = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ProductStatus
    stock_status: str
    created_at: datetime
    updated_at: datetime
