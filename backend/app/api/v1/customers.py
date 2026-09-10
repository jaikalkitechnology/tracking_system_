from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_staff
from app.database.database import get_db
from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerDetailResponse, CustomerResponse, CustomerUpdate
from app.utils.pagination import PaginatedResponse, PaginationParams, paginate
from app.utils.response import AppError

router = APIRouter(prefix="/customers", tags=["Customers"])


def _generate_customer_code(db: Session) -> str:
    count = db.query(Customer).count()
    return f"CUST{count + 1:06d}"


@router.get("", response_model=PaginatedResponse[CustomerResponse])
def list_customers(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    _staff: User = Depends(require_staff),
):
    query = select(Customer)
    if search:
        query = query.filter(
            Customer.name.ilike(f"%{search}%") | Customer.email.ilike(f"%{search}%") | Customer.customer_code.ilike(f"%{search}%")
        )
    if status:
        query = query.filter(Customer.status == status)
    query = query.order_by(Customer.created_at.desc())
    return paginate(db, query, pagination, CustomerResponse)


@router.post("", response_model=CustomerResponse, status_code=201)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    customer = Customer(customer_code=_generate_customer_code(db), **payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/{customer_id}", response_model=CustomerDetailResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise AppError(404, "Customer not found", "CUSTOMER_NOT_FOUND")
    return customer


@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db), _staff: User = Depends(require_staff)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise AppError(404, "Customer not found", "CUSTOMER_NOT_FOUND")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: int, db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise AppError(404, "Customer not found", "CUSTOMER_NOT_FOUND")
    db.delete(customer)
    db.commit()
