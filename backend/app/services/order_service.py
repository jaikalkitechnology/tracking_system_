import random
import string
from datetime import datetime, timezone

from fastapi import status
from sqlalchemy.orm import Session

from app.models.order import Order, OrderStatus, PaymentStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderUpdate
from app.utils.response import AppError


def generate_order_number() -> str:
    date_part = datetime.now(timezone.utc).strftime("%Y%m%d")
    rand_part = "".join(random.choices(string.digits, k=6))
    return f"ORD-{date_part}-{rand_part}"


def create_order(db: Session, payload: OrderCreate) -> Order:
    if not payload.items:
        raise AppError(status.HTTP_400_BAD_REQUEST, "Order must contain at least one item", "EMPTY_ORDER")

    product_ids = [item.product_id for item in payload.items]
    products = {p.id: p for p in db.query(Product).filter(Product.id.in_(product_ids)).all()}

    order = Order(
        order_number=generate_order_number(),
        customer_id=payload.customer_id,
        shipping_address_id=payload.shipping_address_id,
        billing_address_id=payload.billing_address_id,
        payment_status=PaymentStatus.PENDING,
        order_status=OrderStatus.PENDING,
        total_amount=0,
    )
    db.add(order)
    db.flush()

    total_amount = 0.0
    for item in payload.items:
        product = products.get(item.product_id)
        if not product:
            raise AppError(status.HTTP_404_NOT_FOUND, f"Product {item.product_id} not found", "PRODUCT_NOT_FOUND")
        item_total = float(product.price) * item.quantity
        total_amount += item_total
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                price=product.price,
                total=item_total,
            )
        )

    order.total_amount = total_amount
    db.commit()
    db.refresh(order)
    return order


def update_order(db: Session, order: Order, payload: OrderUpdate) -> Order:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order
