import hashlib
import hmac

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.courier import Courier
from app.models.shipment import Shipment, ShipmentStatus
from app.schemas.tracking import TrackingEventCreate
from app.services.tracking_service import change_shipment_status
from app.utils.response import AppError

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


def _verify_signature(secret: str | None, raw_body: bytes, signature: str | None) -> bool:
    if not secret:
        # No secret configured for this courier: accept (manual/dev couriers).
        return True
    if not signature:
        return False
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/{courier}")
async def courier_webhook(
    courier: str,
    request: Request,
    x_webhook_signature: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    raw_body = await request.body()
    courier_obj = db.query(Courier).filter(Courier.code == courier).first()
    if not courier_obj:
        raise AppError(404, "Unknown courier", "COURIER_NOT_FOUND")

    if not _verify_signature(courier_obj.api_key, raw_body, x_webhook_signature):
        raise AppError(401, "Invalid webhook signature", "INVALID_SIGNATURE")

    payload = await request.json()
    tracking_number = payload.get("tracking_number")
    status_value = payload.get("status")
    if not tracking_number or not status_value:
        raise AppError(400, "tracking_number and status are required", "INVALID_PAYLOAD")

    shipment = db.query(Shipment).filter(Shipment.tracking_number == tracking_number).first()
    if not shipment:
        raise AppError(404, "Shipment not found for tracking number", "SHIPMENT_NOT_FOUND")

    try:
        new_status = ShipmentStatus(status_value)
    except ValueError:
        raise AppError(400, f"Unknown shipment status: {status_value}", "INVALID_STATUS")

    event = TrackingEventCreate(
        status=new_status,
        title=payload.get("title") or new_status.value.replace("_", " ").title(),
        description=payload.get("description"),
        location=payload.get("location"),
        latitude=payload.get("latitude"),
        longitude=payload.get("longitude"),
    )

    change_shipment_status(
        db,
        shipment,
        event.status,
        title=event.title,
        description=event.description,
        location=event.location,
        latitude=event.latitude,
        longitude=event.longitude,
    )

    return {"success": True, "message": "Webhook processed"}
