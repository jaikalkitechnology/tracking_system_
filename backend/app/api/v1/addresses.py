from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user
from app.database.database import get_db
from app.models.address import Address
from app.models.customer import Customer
from app.models.user import User, UserRole
from app.schemas.address import AddressCreate, AddressResponse, AddressUpdate
from app.utils.response import AppError

router = APIRouter(prefix="/addresses", tags=["Addresses"])


def _assert_can_access_customer(customer_id: int, current_user: User, db: Session) -> None:
    if current_user.role == UserRole.CUSTOMER:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if not customer or customer.id != customer_id:
            raise AppError(403, "Not allowed to access this customer's addresses", "FORBIDDEN")


@router.get("", response_model=list[AddressResponse])
def list_addresses(
    customer_id: int = Query(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    _assert_can_access_customer(customer_id, current_user, db)
    return db.query(Address).filter(Address.customer_id == customer_id).all()


@router.post("", response_model=AddressResponse, status_code=201)
def create_address(payload: AddressCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _assert_can_access_customer(payload.customer_id, current_user, db)
    address = Address(**payload.model_dump())
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int, payload: AddressUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise AppError(404, "Address not found", "ADDRESS_NOT_FOUND")
    _assert_can_access_customer(address.customer_id, current_user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(address, field, value)
    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}", status_code=204)
def delete_address(address_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise AppError(404, "Address not found", "ADDRESS_NOT_FOUND")
    _assert_can_access_customer(address.customer_id, current_user, db)
    db.delete(address)
    db.commit()
