"""add payment_method to orders

Revision ID: 0003
Revises: 0002
Create Date: 2026-10-04 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    payment_method = sa.Enum("ONLINE", "COD", name="paymentmethod")
    payment_method.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "orders",
        sa.Column("payment_method", payment_method, nullable=False, server_default="ONLINE"),
    )


def downgrade() -> None:
    op.drop_column("orders", "payment_method")
    sa.Enum(name="paymentmethod").drop(op.get_bind(), checkfirst=True)
