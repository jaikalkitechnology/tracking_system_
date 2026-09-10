from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.permissions import get_current_user, require_staff
from app.database.database import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.shipment import Shipment
from app.models.user import User, UserRole
from app.schemas.shipment import ShipmentCreate, ShipmentDetailResponse, ShipmentResponse, ShipmentStatusUpdate, ShipmentUpdate
from app.services.shipment_service import create_shipment
from app.services.tracking_service import change_shipment_status
from app.utils.pagination import PaginatedResponse, PaginationParams, paginate
from app.utils.response import AppError

router = APIRouter(prefix="/shipments", tags=["Shipments"])


def _scope_to_customer_if_needed(query, current_user: User, db: Session):
    if current_user.role == UserRole.CUSTOMER:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if not customer:
            return query.filter(False)
        return query.join(Order, Shipment.order_id == Order.id).filter(Order.customer_id == customer.id)
    return query


@router.get("", response_model=PaginatedResponse[ShipmentResponse])
def list_shipments(
    pagination: PaginationParams = Depends(),
    tracking_number: str | None = Query(None),
    order_number: str | None = Query(None),
    status: str | None = Query(None),
    courier_id: int | None = Query(None),
    warehouse_id: int | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Shipment)
    if tracking_number:
        query = query.filter(Shipment.tracking_number.ilike(f"%{tracking_number}%"))
    if order_number:
        query = query.join(Order, Shipment.order_id == Order.id).filter(Order.order_number.ilike(f"%{order_number}%"))
    if status:
        query = query.filter(Shipment.status == status)
    if courier_id:
        query = query.filter(Shipment.courier_id == courier_id)
    if warehouse_id:
        query = query.filter(Shipment.warehouse_id == warehouse_id)
    query = _scope_to_customer_if_needed(query, current_user, db)
    query = query.order_by(Shipment.created_at.desc())
    return paginate(db, query, pagination, ShipmentResponse)


@router.post("", response_model=ShipmentResponse, status_code=201)
def create_shipment_endpoint(payload: ShipmentCreate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise AppError(404, "Order not found", "ORDER_NOT_FOUND")
    return create_shipment(db, order, payload)


def _get_shipment_or_404(shipment_id: int, db: Session, current_user: User) -> Shipment:
    shipment = (
        db.query(Shipment)
        .options(joinedload(Shipment.courier), joinedload(Shipment.warehouse), joinedload(Shipment.tracking_events))
        .filter(Shipment.id == shipment_id)
        .first()
    )
    if not shipment:
        raise AppError(404, "Shipment not found", "SHIPMENT_NOT_FOUND")
    if current_user.role == UserRole.CUSTOMER:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        order = db.query(Order).filter(Order.id == shipment.order_id).first()
        if not customer or not order or order.customer_id != customer.id:
            raise AppError(404, "Shipment not found", "SHIPMENT_NOT_FOUND")
    return shipment


@router.get("/{shipment_id}", response_model=ShipmentDetailResponse)
def get_shipment(shipment_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_shipment_or_404(shipment_id, db, current_user)


@router.put("/{shipment_id}", response_model=ShipmentResponse)
def update_shipment(
    shipment_id: int, payload: ShipmentUpdate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise AppError(404, "Shipment not found", "SHIPMENT_NOT_FOUND")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(shipment, field, value)
    db.commit()
    db.refresh(shipment)
    return shipment


@router.post("/{shipment_id}/status", response_model=ShipmentDetailResponse)
def update_shipment_status(
    shipment_id: int, payload: ShipmentStatusUpdate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)
):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise AppError(404, "Shipment not found", "SHIPMENT_NOT_FOUND")
    change_shipment_status(
        db,
        shipment,
        payload.status,
        title=payload.title,
        description=payload.description,
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )
    db.refresh(shipment)
    return shipment


@router.delete("/{shipment_id}", status_code=204)
def delete_shipment(shipment_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise AppError(404, "Shipment not found", "SHIPMENT_NOT_FOUND")
    db.delete(shipment)
    db.commit()
