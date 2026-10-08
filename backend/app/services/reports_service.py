from datetime import datetime, timedelta, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.services.dashboard_service import compute_trend


def _window(days: int) -> tuple[datetime, datetime, datetime]:
    now = datetime.now(timezone.utc)
    current_start = now - timedelta(days=days)
    previous_start = now - timedelta(days=days * 2)
    return previous_start, current_start, now


def get_reports_summary(db: Session, days: int = 7) -> dict:
    previous_start, current_start, now = _window(days)

    def orders_count(start: datetime, end: datetime) -> int:
        return db.query(func.count(Order.id)).filter(Order.created_at >= start, Order.created_at < end).scalar() or 0

    def revenue(start: datetime, end: datetime) -> float:
        return float(
            db.query(func.coalesce(func.sum(Order.total_amount), 0))
            .filter(Order.created_at >= start, Order.created_at < end)
            .scalar()
            or 0
        )

    def products_sold(start: datetime, end: datetime) -> int:
        return int(
            db.query(func.coalesce(func.sum(OrderItem.quantity), 0))
            .join(Order, OrderItem.order_id == Order.id)
            .filter(Order.created_at >= start, Order.created_at < end)
            .scalar()
            or 0
        )

    def new_customers(start: datetime, end: datetime) -> int:
        return (
            db.query(func.count(Customer.id)).filter(Customer.created_at >= start, Customer.created_at < end).scalar()
            or 0
        )

    orders_now, orders_prev = orders_count(current_start, now), orders_count(previous_start, current_start)
    revenue_now, revenue_prev = revenue(current_start, now), revenue(previous_start, current_start)
    sold_now, sold_prev = products_sold(current_start, now), products_sold(previous_start, current_start)
    cust_now, cust_prev = new_customers(current_start, now), new_customers(previous_start, current_start)

    return {
        "total_orders": orders_now,
        "total_orders_trend": compute_trend(orders_now, orders_prev),
        "total_revenue": revenue_now,
        "total_revenue_trend": compute_trend(revenue_now, revenue_prev),
        "products_sold": sold_now,
        "products_sold_trend": compute_trend(sold_now, sold_prev),
        "new_customers": cust_now,
        "new_customers_trend": compute_trend(cust_now, cust_prev),
    }


def get_sales_overview(db: Session, days: int = 7) -> list[dict]:
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        db.query(func.date(Order.created_at), func.count(Order.id), func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.created_at >= since)
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
        .all()
    )
    return [{"date": str(day), "orders": count, "revenue": float(rev)} for day, count, rev in rows]


def get_order_status_breakdown(db: Session) -> list[dict]:
    rows = db.query(Order.order_status, func.count(Order.id)).group_by(Order.order_status).all()
    total = sum(count for _, count in rows) or 1
    return [
        {"status": status.value, "count": count, "percent": round(count / total * 100, 1)} for status, count in rows
    ]


def get_top_selling_products(db: Session, days: int = 30, page: int = 1, limit: int = 5) -> dict:
    since = datetime.now(timezone.utc) - timedelta(days=days)
    base_query = (
        db.query(
            Product.id,
            Product.name,
            Product.category,
            Product.image_url,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("sold"),
            func.coalesce(func.sum(OrderItem.total), 0).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.created_at >= since)
        .group_by(Product.id, Product.name, Product.category, Product.image_url)
    )
    total = base_query.count()
    rows = (
        base_query.order_by(func.sum(OrderItem.quantity).desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    items = [
        {
            "product_id": pid,
            "name": name,
            "category": category,
            "image_url": image_url,
            "sold": int(sold),
            "revenue": float(revenue),
        }
        for pid, name, category, image_url, sold, revenue in rows
    ]
    pages = (total + limit - 1) // limit if total else 0
    return {"items": items, "total": total, "page": page, "limit": limit, "pages": pages}


def get_sales_by_category(db: Session, days: int = 30, page: int = 1, limit: int = 5) -> dict:
    since = datetime.now(timezone.utc) - timedelta(days=days)
    base_query = (
        db.query(
            Product.category,
            func.count(func.distinct(Order.id)).label("orders"),
            func.coalesce(func.sum(OrderItem.total), 0).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(Order.created_at >= since, Product.category.isnot(None))
        .group_by(Product.category)
    )
    total = base_query.count()
    rows = (
        base_query.order_by(func.sum(OrderItem.total).desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    items = [{"category": category, "orders": orders, "revenue": float(revenue)} for category, orders, revenue in rows]
    pages = (total + limit - 1) // limit if total else 0
    return {"items": items, "total": total, "page": page, "limit": limit, "pages": pages}
