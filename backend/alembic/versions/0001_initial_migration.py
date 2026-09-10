"""initial migration

Revision ID: 0001
Revises:
Create Date: 2026-09-10 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(191), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "role",
            sa.Enum("SUPER_ADMIN", "ADMIN", "MANAGER", "WAREHOUSE", "CUSTOMER", name="userrole"),
            nullable=False,
            server_default="CUSTOMER",
        ),
        sa.Column(
            "status", sa.Enum("ACTIVE", "INACTIVE", "SUSPENDED", name="userstatus"), nullable=False, server_default="ACTIVE"
        ),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"])

    op.create_table(
        "warehouses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("code", sa.String(30), nullable=False),
        sa.Column("address", sa.String(255), nullable=True),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("state", sa.String(100), nullable=False),
        sa.Column("pincode", sa.String(20), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(10, 6), nullable=True),
        sa.Column("status", sa.Enum("ACTIVE", "INACTIVE", name="warehousestatus"), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_warehouses_code", "warehouses", ["code"], unique=True)

    op.create_table(
        "delivery_partners",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("code", sa.String(30), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("email", sa.String(191), nullable=True),
        sa.Column("api_url", sa.String(255), nullable=True),
        sa.Column("api_key", sa.String(255), nullable=True),
        sa.Column("status", sa.Enum("ACTIVE", "INACTIVE", name="courierstatus"), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_delivery_partners_code", "delivery_partners", ["code"], unique=True)

    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, unique=True),
        sa.Column("customer_code", sa.String(30), nullable=False),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(191), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("status", sa.Enum("ACTIVE", "INACTIVE", name="customerstatus"), nullable=False, server_default="ACTIVE"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_customers_customer_code", "customers", ["customer_code"], unique=True)
    op.create_index("ix_customers_email", "customers", ["email"])

    op.create_table(
        "addresses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("address_line1", sa.String(255), nullable=False),
        sa.Column("address_line2", sa.String(255), nullable=True),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("state", sa.String(100), nullable=False),
        sa.Column("pincode", sa.String(20), nullable=False),
        sa.Column("country", sa.String(100), nullable=False, server_default="India"),
        sa.Column("latitude", sa.Numeric(10, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(10, 6), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_addresses_customer_id", "addresses", ["customer_id"])

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("sku", sa.String(50), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("weight", sa.Numeric(10, 3), nullable=True),
        sa.Column(
            "status",
            sa.Enum("ACTIVE", "INACTIVE", "DISCONTINUED", name="productstatus"),
            nullable=False,
            server_default="ACTIVE",
        ),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_number", sa.String(40), nullable=False),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column(
            "payment_status",
            sa.Enum("PENDING", "PAID", "FAILED", "REFUNDED", name="paymentstatus"),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column(
            "order_status",
            sa.Enum("PENDING", "CONFIRMED", "PACKED", "CANCELLED", "COMPLETED", name="orderstatus"),
            nullable=False,
            server_default="PENDING",
        ),
        sa.Column("shipping_address_id", sa.Integer(), sa.ForeignKey("addresses.id"), nullable=True),
        sa.Column("billing_address_id", sa.Integer(), sa.ForeignKey("addresses.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_orders_order_number", "orders", ["order_number"], unique=True)
    op.create_index("ix_orders_customer_id", "orders", ["customer_id"])
    op.create_index("ix_orders_order_status", "orders", ["order_status"])

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("total", sa.Numeric(12, 2), nullable=False),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"])

    shipment_status_enum = sa.Enum(
        "ORDER_CONFIRMED",
        "PACKED",
        "READY_FOR_PICKUP",
        "PICKED_UP",
        "IN_TRANSIT",
        "ARRIVED_AT_HUB",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "DELIVERY_FAILED",
        "CANCELLED",
        "RETURN_REQUESTED",
        "RETURNED",
        "RTO",
        "ON_HOLD",
        name="shipmentstatus",
    )

    op.create_table(
        "shipments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("shipment_number", sa.String(40), nullable=False),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("tracking_number", sa.String(40), nullable=False),
        sa.Column("courier_id", sa.Integer(), sa.ForeignKey("delivery_partners.id"), nullable=True),
        sa.Column("warehouse_id", sa.Integer(), sa.ForeignKey("warehouses.id"), nullable=True),
        sa.Column("status", shipment_status_enum, nullable=False, server_default="ORDER_CONFIRMED"),
        sa.Column("weight", sa.Numeric(10, 3), nullable=True),
        sa.Column("shipping_cost", sa.Numeric(12, 2), nullable=True),
        sa.Column("pickup_date", sa.Date(), nullable=True),
        sa.Column("estimated_delivery_date", sa.Date(), nullable=True),
        sa.Column("actual_delivery_date", sa.Date(), nullable=True),
        sa.Column("origin", sa.String(150), nullable=True),
        sa.Column("destination", sa.String(150), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_shipments_shipment_number", "shipments", ["shipment_number"], unique=True)
    op.create_index("ix_shipments_order_id", "shipments", ["order_id"])
    op.create_index("ix_shipments_tracking_number", "shipments", ["tracking_number"], unique=True)
    op.create_index("ix_shipments_status", "shipments", ["status"])

    op.create_table(
        "tracking_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("shipment_id", sa.Integer(), sa.ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", shipment_status_enum, nullable=False),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", sa.String(200), nullable=True),
        sa.Column("latitude", sa.Numeric(10, 6), nullable=True),
        sa.Column("longitude", sa.Numeric(10, 6), nullable=True),
        sa.Column("event_time", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_tracking_events_shipment_id", "tracking_events", ["shipment_id"])

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shipment_id", sa.Integer(), sa.ForeignKey("shipments.id", ondelete="CASCADE"), nullable=True),
        sa.Column(
            "type",
            sa.Enum(
                "ORDER_CONFIRMED",
                "SHIPMENT_PICKED_UP",
                "IN_TRANSIT",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "DELIVERY_FAILED",
                "RETURN_STARTED",
                name="notificationtype",
            ),
            nullable=False,
        ),
        sa.Column("title", sa.String(150), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])


def downgrade() -> None:
    op.drop_table("notifications")
    op.drop_table("tracking_events")
    op.drop_table("shipments")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("products")
    op.drop_table("addresses")
    op.drop_table("customers")
    op.drop_table("delivery_partners")
    op.drop_table("warehouses")
    op.drop_table("users")
