"""add category, stock_quantity and low_stock_threshold to products

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("category", sa.String(length=80), nullable=True))
    op.create_index("ix_products_category", "products", ["category"])
    op.add_column(
        "products", sa.Column("stock_quantity", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column(
        "products", sa.Column("low_stock_threshold", sa.Integer(), nullable=False, server_default="5")
    )


def downgrade() -> None:
    op.drop_column("products", "low_stock_threshold")
    op.drop_column("products", "stock_quantity")
    op.drop_index("ix_products_category", table_name="products")
    op.drop_column("products", "category")
