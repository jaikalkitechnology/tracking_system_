from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.auth_service import authenticate_user, build_token_pair, refresh_access_token, register_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, payload)
    access_token, refresh_token = build_token_pair(user)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload)
    access_token, refresh_token = build_token_pair(user)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserResponse.model_validate(user))


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    access_token, refresh_token, user = refresh_access_token(db, payload.refresh_token)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token, user=UserResponse.model_validate(user))


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
