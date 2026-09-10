from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None


class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.CUSTOMER


class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    role: UserRole | None = None
    status: UserStatus | None = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    status: UserStatus
    created_at: datetime
    updated_at: datetime
