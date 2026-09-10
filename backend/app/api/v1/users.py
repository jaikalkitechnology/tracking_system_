from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import require_admin
from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.utils.pagination import PaginatedResponse, PaginationParams, paginate
from app.utils.response import AppError

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("", response_model=PaginatedResponse[UserResponse])
def list_users(
    pagination: PaginationParams = Depends(),
    search: str | None = Query(None),
    role: str | None = Query(None),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    query = select(User)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    if role:
        query = query.filter(User.role == role)
    query = query.order_by(User.created_at.desc())
    return paginate(db, query, pagination, UserResponse)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AppError(404, "User not found", "USER_NOT_FOUND")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AppError(404, "User not found", "USER_NOT_FOUND")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AppError(404, "User not found", "USER_NOT_FOUND")
    db.delete(user)
    db.commit()
