from datetime import datetime

from pydantic import BaseModel, ConfigDict


class StoreSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    store_name: str
    store_email: str | None
    store_phone: str | None
    website: str | None
    logo_url: str | None

    address_line1: str | None
    address_line2: str | None
    city: str | None
    state: str | None
    pincode: str | None
    country: str

    contact_name: str | None
    contact_designation: str | None
    contact_email: str | None
    contact_alternate_email: str | None
    contact_phone: str | None
    contact_alternate_phone: str | None

    default_shipping_charge: float
    free_shipping_threshold: float | None
    tax_rate_percent: float
    currency: str

    allow_guest_checkout: bool
    show_low_stock_alerts: bool
    enable_product_reviews: bool
    maintenance_mode: bool
    enable_inventory_tracking: bool
    send_order_notifications: bool

    updated_at: datetime


class StoreSettingsUpdate(BaseModel):
    store_name: str | None = None
    store_email: str | None = None
    store_phone: str | None = None
    website: str | None = None
    logo_url: str | None = None

    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = None

    contact_name: str | None = None
    contact_designation: str | None = None
    contact_email: str | None = None
    contact_alternate_email: str | None = None
    contact_phone: str | None = None
    contact_alternate_phone: str | None = None

    default_shipping_charge: float | None = None
    free_shipping_threshold: float | None = None
    tax_rate_percent: float | None = None
    currency: str | None = None

    allow_guest_checkout: bool | None = None
    show_low_stock_alerts: bool | None = None
    enable_product_reviews: bool | None = None
    maintenance_mode: bool | None = None
    enable_inventory_tracking: bool | None = None
    send_order_notifications: bool | None = None
