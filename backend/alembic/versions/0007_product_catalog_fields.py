"""add brand, barcode, tags, dimensions, compare/cost price and product_images table

Revision ID: 0007
Revises: 0006
Create Date: 2026-10-03 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("brand", sa.String(length=100), nullable=True))
    op.add_column("products", sa.Column("barcode", sa.String(length=64), nullable=True))
    op.add_column("products", sa.Column("tags", sa.String(length=300), nullable=True))
    op.add_column("products", sa.Column("compare_price", sa.Numeric(12, 2), nullable=True))
    op.add_column("products", sa.Column("cost_price", sa.Numeric(12, 2), nullable=True))
    op.add_column("products", sa.Column("length_cm", sa.Numeric(8, 2), nullable=True))
    op.add_column("products", sa.Column("width_cm", sa.Numeric(8, 2), nullable=True))
    op.add_column("products", sa.Column("height_cm", sa.Numeric(8, 2), nullable=True))

    op.create_table(
        "product_images",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("product_images")
    op.drop_column("products", "height_cm")
    op.drop_column("products", "width_cm")
    op.drop_column("products", "length_cm")
    op.drop_column("products", "cost_price")
    op.drop_column("products", "compare_price")
    op.drop_column("products", "tags")
    op.drop_column("products", "barcode")
    op.drop_column("products", "brand")
