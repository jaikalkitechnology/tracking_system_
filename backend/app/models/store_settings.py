from sqlalchemy import Boolean, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.models.mixins import TimestampMixin


class StoreSettings(TimestampMixin, Base):
    """Singleton row (id=1) holding the store's own configuration."""

    __tablename__ = "store_settings"

    id: Mapped[int] = mapped_column(primary_key=True)

    store_name: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    store_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    store_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    website: Mapped[str | None] = mapped_column(String(200), nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    address_line1: Mapped[str | None] = mapped_column(String(200), nullable=True)
    address_line2: Mapped[str | None] = mapped_column(String(200), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    state: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pincode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="India")

    contact_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_designation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    contact_alternate_email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    contact_alternate_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    default_shipping_charge: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    free_shipping_threshold: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    tax_rate_percent: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="INR")

    allow_guest_checkout: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    show_low_stock_alerts: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    enable_product_reviews: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    maintenance_mode: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    enable_inventory_tracking: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    send_order_notifications: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
