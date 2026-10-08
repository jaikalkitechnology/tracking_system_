"""add NEW_ORDER to notifications.type enum

Revision ID: 0009
Revises: 0008
Create Date: 2026-10-06 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


OLD_VALUES = (
    "ORDER_CONFIRMED",
    "SHIPMENT_PICKED_UP",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "DELIVERY_FAILED",
    "RETURN_STARTED",
)
NEW_VALUES = ("NEW_ORDER",) + OLD_VALUES


def upgrade() -> None:
    op.alter_column(
        "notifications",
        "type",
        existing_type=sa.Enum(*OLD_VALUES, name="notificationtype"),
        type_=sa.Enum(*NEW_VALUES, name="notificationtype"),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "notifications",
        "type",
        existing_type=sa.Enum(*NEW_VALUES, name="notificationtype"),
        type_=sa.Enum(*OLD_VALUES, name="notificationtype"),
        existing_nullable=False,
    )
