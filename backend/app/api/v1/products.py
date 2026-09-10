from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_staff
from app.database.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.utils.pagination import PaginatedResponse, PaginationParams, paginate
from app.utils.response import AppError

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=PaginatedResponse[ProductResponse])
def list_products(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None),
    status: str | None = Query(None),
    sort_by: str = Query("created_at"),
    order: str = Query("desc"),
    db: Session = Depends(get_db),
):
    query = select(Product)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%"))
    if status:
        query = query.filter(Product.status == status)
    sort_column = getattr(Product, sort_by, Product.created_at)
    query = query.order_by(sort_column.desc() if order == "desc" else sort_column.asc())
    return paginate(db, query, pagination, ProductResponse)


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise AppError(409, "SKU already exists", "SKU_EXISTS")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise AppError(404, "Product not found", "PRODUCT_NOT_FOUND")
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int, payload: ProductUpdate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise AppError(404, "Product not found", "PRODUCT_NOT_FOUND")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise AppError(404, "Product not found", "PRODUCT_NOT_FOUND")
    db.delete(product)
    db.commit()
