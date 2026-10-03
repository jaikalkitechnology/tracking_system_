"""add store_settings table

Revision ID: 0008
Revises: 0007
Create Date: 2026-10-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "store_settings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=False),
        sa.Column("store_name", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("store_email", sa.String(length=200), nullable=True),
        sa.Column("store_phone", sa.String(length=20), nullable=True),
        sa.Column("website", sa.String(length=200), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("address_line1", sa.String(length=200), nullable=True),
        sa.Column("address_line2", sa.String(length=200), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("state", sa.String(length=100), nullable=True),
        sa.Column("pincode", sa.String(length=10), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=False, server_default="India"),
        sa.Column("contact_name", sa.String(length=100), nullable=True),
        sa.Column("contact_designation", sa.String(length=100), nullable=True),
        sa.Column("contact_email", sa.String(length=200), nullable=True),
        sa.Column("contact_alternate_email", sa.String(length=200), nullable=True),
        sa.Column("contact_phone", sa.String(length=20), nullable=True),
        sa.Column("contact_alternate_phone", sa.String(length=20), nullable=True),
        sa.Column("default_shipping_charge", sa.Numeric(10, 2), nullable=False, server_default="0"),
        sa.Column("free_shipping_threshold", sa.Numeric(10, 2), nullable=True),
        sa.Column("tax_rate_percent", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="INR"),
        sa.Column("allow_guest_checkout", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("show_low_stock_alerts", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("enable_product_reviews", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("maintenance_mode", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("enable_inventory_tracking", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("send_order_notifications", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("store_settings")
