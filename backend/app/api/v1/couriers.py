from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_admin, require_staff
from app.database.database import get_db
from app.models.courier import Courier
from app.models.user import User
from app.schemas.courier import CourierCreate, CourierResponse, CourierUpdate
from app.utils.pagination import PaginatedResponse, PaginationParams, paginate
from app.utils.response import AppError

router = APIRouter(prefix="/couriers", tags=["Couriers"])


@router.get("", response_model=PaginatedResponse[CourierResponse])
def list_couriers(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    query = select(Courier)
    if search:
        query = query.filter(Courier.name.ilike(f"%{search}%") | Courier.code.ilike(f"%{search}%"))
    if status:
        query = query.filter(Courier.status == status)
    query = query.order_by(Courier.created_at.desc())
    return paginate(db, query, pagination, CourierResponse)


@router.post("", response_model=CourierResponse, status_code=201)
def create_courier(payload: CourierCreate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    existing = db.query(Courier).filter(Courier.code == payload.code).first()
    if existing:
        raise AppError(409, "Courier code already exists", "COURIER_CODE_EXISTS")
    courier = Courier(**payload.model_dump())
    db.add(courier)
    db.commit()
    db.refresh(courier)
    return courier


@router.get("/{courier_id}", response_model=CourierResponse)
def get_courier(courier_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not courier:
        raise AppError(404, "Courier not found", "COURIER_NOT_FOUND")
    return courier


@router.put("/{courier_id}", response_model=CourierResponse)
def update_courier(
    courier_id: int, payload: CourierUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)
):
    courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not courier:
        raise AppError(404, "Courier not found", "COURIER_NOT_FOUND")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(courier, field, value)
    db.commit()
    db.refresh(courier)
    return courier


@router.delete("/{courier_id}", status_code=204)
def delete_courier(courier_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    courier = db.query(Courier).filter(Courier.id == courier_id).first()
    if not courier:
        raise AppError(404, "Courier not found", "COURIER_NOT_FOUND")
    db.delete(courier)
    db.commit()
