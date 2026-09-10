from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.permissions import get_current_user, require_staff
from app.database.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.user import User, UserRole
from app.schemas.order import OrderCreate, OrderDetailResponse, OrderResponse, OrderUpdate
from app.services.order_service import create_order, update_order
from app.utils.pagination import PaginatedResponse, PaginationParams, paginate
from app.utils.response import AppError

router = APIRouter(prefix="/orders", tags=["Orders"])


def _scope_to_customer_if_needed(query, current_user: User, db: Session):
    if current_user.role == UserRole.CUSTOMER:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if not customer:
            return query.filter(False)
        return query.filter(Order.customer_id == customer.id)
    return query


@router.get("", response_model=PaginatedResponse[OrderResponse])
def list_orders(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None),
    order_status: str | None = Query(None),
    payment_status: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Order)
    if search:
        query = query.filter(Order.order_number.ilike(f"%{search}%"))
    if order_status:
        query = query.filter(Order.order_status == order_status)
    if payment_status:
        query = query.filter(Order.payment_status == payment_status)
    query = _scope_to_customer_if_needed(query, current_user, db)
    query = query.order_by(Order.created_at.desc())
    return paginate(db, query, pagination, OrderResponse)


@router.post("", response_model=OrderResponse, status_code=201)
def create_order_endpoint(payload: OrderCreate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return create_order(db, payload)


def _get_order_or_404(order_id: int, db: Session, current_user: User) -> Order:
    query = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.shipping_address),
        joinedload(Order.billing_address),
        joinedload(Order.items),
    )
    order = query.filter(Order.id == order_id).first()
    if not order:
        raise AppError(404, "Order not found", "ORDER_NOT_FOUND")
    if current_user.role == UserRole.CUSTOMER:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if not customer or order.customer_id != customer.id:
            raise AppError(404, "Order not found", "ORDER_NOT_FOUND")
    return order


@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_order_or_404(order_id, db, current_user)


@router.put("/{order_id}", response_model=OrderResponse)
def update_order_endpoint(
    order_id: int, payload: OrderUpdate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise AppError(404, "Order not found", "ORDER_NOT_FOUND")
    return update_order(db, order, payload)


@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise AppError(404, "Order not found", "ORDER_NOT_FOUND")
    db.delete(order)
    db.commit()
