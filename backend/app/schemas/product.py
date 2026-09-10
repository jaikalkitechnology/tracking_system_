from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.product import ProductStatus


class ProductBase(BaseModel):
    sku: str
    name: str
    description: str | None = None
    price: float
    weight: float | None = None


class ProductCreate(ProductBase):
    status: ProductStatus = ProductStatus.ACTIVE


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    weight: float | None = None
    status: ProductStatus | None = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: ProductStatus
    created_at: datetime
    updated_at: datetime
