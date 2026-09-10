from fastapi import status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, decode_token, hash_password, verify_password
from app.models.customer import Customer, CustomerStatus
from app.models.user import User, UserRole, UserStatus
from app.schemas.auth import LoginRequest, RegisterRequest
from app.utils.response import AppError


def register_user(db: Session, payload: RegisterRequest) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise AppError(status.HTTP_409_CONFLICT, "Email already registered", "EMAIL_EXISTS")

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=UserRole.CUSTOMER,
        status=UserStatus.ACTIVE,
    )
    db.add(user)
    db.flush()

    customer_code = f"CUST{user.id:06d}"
    customer = Customer(
        user_id=user.id,
        customer_code=customer_code,
        name=user.name,
        email=user.email,
        phone=user.phone,
        status=CustomerStatus.ACTIVE,
    )
    db.add(customer)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, payload: LoginRequest) -> User:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise AppError(status.HTTP_401_UNAUTHORIZED, "Invalid email or password", "INVALID_CREDENTIALS")
    if user.status != UserStatus.ACTIVE:
        raise AppError(status.HTTP_403_FORBIDDEN, "Account is not active", "ACCOUNT_INACTIVE")
    return user


def build_token_pair(user: User) -> tuple[str, str]:
    return create_access_token(user.id, user.role.value), create_refresh_token(user.id)


def refresh_access_token(db: Session, refresh_token: str) -> tuple[str, str, User]:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise AppError(status.HTTP_401_UNAUTHORIZED, "Invalid or expired refresh token", "INVALID_REFRESH_TOKEN")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or user.status != UserStatus.ACTIVE:
        raise AppError(status.HTTP_401_UNAUTHORIZED, "User not found or inactive", "INVALID_REFRESH_TOKEN")

    access_token, new_refresh_token = build_token_pair(user)
    return access_token, new_refresh_token, user
