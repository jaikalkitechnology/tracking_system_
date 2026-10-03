from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.permissions import require_staff
from app.database.database import get_db
from app.models.user import User
from app.services.reports_service import (
    get_order_status_breakdown,
    get_reports_summary,
    get_sales_by_category,
    get_sales_overview,
    get_top_selling_products,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary")
def summary(days: int = 7, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return get_reports_summary(db, days)


@router.get("/sales-overview")
def sales_overview(days: int = 7, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return get_sales_overview(db, days)


@router.get("/order-status-breakdown")
def order_status_breakdown(db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return get_order_status_breakdown(db)


@router.get("/top-selling-products")
def top_selling_products(
    days: int = 30, limit: int = 5, db: Session = Depends(get_db), _staff: User = Depends(require_staff)
):
    return get_top_selling_products(db, days, limit)


@router.get("/sales-by-category")
def sales_by_category(days: int = 30, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return get_sales_by_category(db, days)
