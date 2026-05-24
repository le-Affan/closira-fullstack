from datetime import datetime, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.logger import get_logger
from app.models import Enquiry, FollowUp, Message, StatusTimeline
from app.schemas import (
    EnquiryCreate,
    EnquiryCreatedResponse,
    EnquiryHistoryResponse,
    EscalateCreate,
    EscalateResponse,
    FollowUpCreate,
    FollowUpResponse,
)
from app.tasks.sop_matcher import process_enquiry

router = APIRouter(prefix="/enquiry", tags=["Enquiry"])

logger = get_logger("routes.enquiry")


# POST /enquiry
@router.post(
    "/",
    response_model=EnquiryCreatedResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Create a new inbound enquiry",
    description=(
        "Accepts a customer enquiry from WhatsApp, email, or call. "
        "Returns a job ID immediately and processes the enquiry asynchronously in the background."
    ),
)
def create_enquiry(
    payload: EnquiryCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # Create the enquiry record
    enquiry = Enquiry(
        customer_name=payload.customer_name,
        channel=payload.channel.value,
        message=payload.message,
        status="new",
    )

    db.add(enquiry)

    # Store the original customer message
    customer_message = Message(
        enquiry_id=enquiry.id,
        sender="customer",
        content=payload.message,
        timestamp=datetime.utcnow(),
    )

    db.add(customer_message)

    # Add initial timeline entry
    timeline_entry = StatusTimeline(
        enquiry_id=enquiry.id,
        status="new",
        note="Enquiry received",
        timestamp=datetime.utcnow(),
    )

    db.add(timeline_entry)

    db.commit()
    db.refresh(enquiry)

    # Fire background task
    background_tasks.add_task(process_enquiry, enquiry.id, db)

    logger.info(
        "Enquiry created",
        extra={
            "enquiry_id": enquiry.id,
            "channel": payload.channel.value,
            "customer": payload.customer_name,
        },
    )

    return EnquiryCreatedResponse(job_id=enquiry.id)
