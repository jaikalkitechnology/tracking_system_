"""add subtotal, shipping, discount and tax amounts to orders

Revision ID: 0006
Revises: 0005
Create Date: 2026-10-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("subtotal_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("shipping_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("discount_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.add_column("orders", sa.Column("tax_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.execute("UPDATE orders SET subtotal_amount = total_amount")


def downgrade() -> None:
    op.drop_column("orders", "tax_amount")
    op.drop_column("orders", "discount_amount")
    op.drop_column("orders", "shipping_amount")
    op.drop_column("orders", "subtotal_amount")
