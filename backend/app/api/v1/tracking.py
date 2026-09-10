from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.database.database import get_db
from app.models.shipment import Shipment
from app.schemas.tracking import PublicTrackingResponse
from app.utils.response import AppError

router = APIRouter(prefix="/track", tags=["Public Tracking"])


@router.get("/{tracking_number}", response_model=PublicTrackingResponse)
def track_shipment(tracking_number: str, db: Session = Depends(get_db)):
    shipment = (
        db.query(Shipment)
        .options(joinedload(Shipment.tracking_events))
        .filter(Shipment.tracking_number == tracking_number)
        .first()
    )
    if not shipment:
        raise AppError(404, "Tracking number not found", "TRACKING_NOT_FOUND")

    return PublicTrackingResponse(
        tracking_number=shipment.tracking_number,
        status=shipment.status,
        estimated_delivery=shipment.estimated_delivery_date.isoformat() if shipment.estimated_delivery_date else None,
        origin=shipment.origin,
        destination=shipment.destination,
        events=shipment.tracking_events,
    )
