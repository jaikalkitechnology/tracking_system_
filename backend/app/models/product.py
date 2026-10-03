import enum

from sqlalchemy import Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base
from app.models.mixins import TimestampMixin


class ProductStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DISCONTINUED = "DISCONTINUED"


class Product(TimestampMixin, Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    barcode: Mapped[str | None] = mapped_column(String(64), nullable=True)
    tags: Mapped[str | None] = mapped_column(String(300), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    compare_price: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    cost_price: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    weight: Mapped[float | None] = mapped_column(Numeric(10, 3), nullable=True)
    length_cm: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    width_cm: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Numeric(8, 2), nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    status: Mapped[ProductStatus] = mapped_column(Enum(ProductStatus), default=ProductStatus.ACTIVE, nullable=False)

    order_items = relationship("OrderItem", back_populates="product")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.position")

    @property
    def stock_status(self) -> str:
        if self.stock_quantity <= 0:
            return "OUT_OF_STOCK"
        if self.stock_quantity <= self.low_stock_threshold:
            return "LOW_STOCK"
        return "IN_STOCK"

    @property
    def tag_list(self) -> list[str]:
        if not self.tags:
            return []
        return [t.strip() for t in self.tags.split(",") if t.strip()]


class ProductImage(TimestampMixin, Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product = relationship("Product", back_populates="images")
