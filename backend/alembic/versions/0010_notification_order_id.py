"""add order_id to notifications

Revision ID: 0010
Revises: 0009
Create Date: 2026-10-07 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0010"
down_revision: Union[str, None] = "0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("notifications", sa.Column("order_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_notifications_order_id_orders",
        "notifications",
        "orders",
        ["order_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    op.drop_constraint("fk_notifications_order_id_orders", "notifications", type_="foreignkey")
    op.drop_column("notifications", "order_id")
