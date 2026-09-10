from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_staff
from app.database.database import get_db
from app.models.user import User
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseResponse, WarehouseUpdate
from app.utils.pagination import PaginatedResponse, PaginationParams, paginate
from app.utils.response import AppError

router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


@router.get("", response_model=PaginatedResponse[WarehouseResponse])
def list_warehouses(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    query = select(Warehouse)
    if search:
        query = query.filter(Warehouse.name.ilike(f"%{search}%") | Warehouse.code.ilike(f"%{search}%"))
    if status:
        query = query.filter(Warehouse.status == status)
    query = query.order_by(Warehouse.created_at.desc())
    return paginate(db, query, pagination, WarehouseResponse)


@router.post("", response_model=WarehouseResponse, status_code=201)
def create_warehouse(payload: WarehouseCreate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    existing = db.query(Warehouse).filter(Warehouse.code == payload.code).first()
    if existing:
        raise AppError(409, "Warehouse code already exists", "WAREHOUSE_CODE_EXISTS")
    warehouse = Warehouse(**payload.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.get("/{warehouse_id}", response_model=WarehouseResponse)
def get_warehouse(warehouse_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise AppError(404, "Warehouse not found", "WAREHOUSE_NOT_FOUND")
    return warehouse


@router.put("/{warehouse_id}", response_model=WarehouseResponse)
def update_warehouse(
    warehouse_id: int, payload: WarehouseUpdate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise AppError(404, "Warehouse not found", "WAREHOUSE_NOT_FOUND")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(warehouse, field, value)
    db.commit()
    db.refresh(warehouse)
    return warehouse


@router.delete("/{warehouse_id}", status_code=204)
def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not warehouse:
        raise AppError(404, "Warehouse not found", "WAREHOUSE_NOT_FOUND")
    db.delete(warehouse)
    db.commit()
