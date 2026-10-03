from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.permissions import require_admin, require_staff
from app.database.database import get_db
from app.models.store_settings import StoreSettings
from app.models.user import User
from app.schemas.store_settings import StoreSettingsResponse, StoreSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Store Settings"])


def _get_or_create(db: Session) -> StoreSettings:
    settings_row = db.query(StoreSettings).filter(StoreSettings.id == 1).first()
    if not settings_row:
        settings_row = StoreSettings(id=1, store_name="My Store")
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row


@router.get("", response_model=StoreSettingsResponse)
def get_settings(db: Session = Depends(get_db), _staff: User = Depends(require_staff)):
    return _get_or_create(db)


@router.put("", response_model=StoreSettingsResponse)
def update_settings(
    payload: StoreSettingsUpdate, db: Session = Depends(get_db), _admin: User = Depends(require_admin)
):
    settings_row = _get_or_create(db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings_row, field, value)
    db.commit()
    db.refresh(settings_row)
    return settings_row
