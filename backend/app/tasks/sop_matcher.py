from datetime import datetime

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.logger import get_logger
from app.models import Enquiry, Message, StatusTimeline

logger = get_logger("sop_matcher")

# Each SOP has a name, keywords to match against, and a suggested response.
SOPS = [
    {
        "name": "Booking Enquiry",
        "keywords": [
            "book",
            "appointment",
            "schedule",
            "reserve",
            "slot",
            "availability",
        ],
        "response": (
            "Thank you for reaching out. We'd be glad to book you in. "
            "Please let us know your preferred date and time and we'll confirm your appointment shortly."
        ),
    },
    {
        "name": "Pricing Question",
        "keywords": [
            "price",
            "cost",
            "quote",
            "charge",
            "fee",
            "how much",
            "rate",
            "pricing",
        ],
        "response": (
            "Our pricing depends on the specific service you're interested in. "
            "Could you share more details so we can give you an accurate quote?"
        ),
    },
    {
        "name": "Complaint",
        "keywords": [
            "complaint",
            "unhappy",
            "disappointed",
            "refund",
            "bad",
            "worst",
            "angry",
            "upset",
            "wrong",
        ],
        "response": (
            "We're really sorry to hear about your experience. "
            "A member of our team will review your concern and get back to you as soon as possible."
        ),
    },
    {
        "name": "After-Hours Message",
        "keywords": [
            "after hours",
            "closed",
            "tomorrow",
            "weekend",
            "when do you open",
            "office hours",
        ],
        "response": (
            "Unfortunately our office is currently closed. "
            "We'll get back to you during business hours which are Monday to Friday between 9am and 6pm. "
            "For urgent matters, please call our emergency line."
        ),
    },
    {
        "name": "General Follow-Up",
        "keywords": [
            "follow up",
            "following up",
            "any update",
            "heard back",
            "status",
            "checking in",
        ],
        "response": (
            "Thank you for the follow up. We're looking into your enquiry and will have an update for you shortly."
        ),
    },
]


def match_sop(message: str):
    """
    Returns the matching SOP dict or None.
    """
    message_lower = message.lower()
    for sop in SOPS:
        for keyword in sop["keywords"]:
            if keyword in message_lower:
                return sop
    return None


def process_enquiry(enquiry_id: str):
    """
    Background task that:
    1. Opens its own DB session (never reuses the request session)
    2. Fetches the enquiry
    3. Tries to match an SOP
    4. Updates the record with result
    5. Adds an AI message and a timeline event
    6. Auto-escalates if no SOP matched
    """

    logger.info("Background task started", extra={"enquiry_id": enquiry_id})

    # Background tasks must own their session — the request session is already
    # closed by the time FastAPI runs background tasks.
    db: Session = SessionLocal()
    try:
        enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            logger.error(
                "Enquiry not found in background task", extra={"enquiry_id": enquiry_id}
            )
            return

        # Update status to processing
        enquiry.status = "processing"
        enquiry.updated_at = datetime.utcnow()
        _add_timeline(db, enquiry_id, "processing", "Background task started")
        db.commit()

        matched_sop = match_sop(enquiry.message)
        if matched_sop:
            # SOP matched so update with suggested response
            enquiry.sop_match = matched_sop["name"]
            enquiry.suggested_response = matched_sop["response"]
            enquiry.status = "sop_matched"
            enquiry.updated_at = datetime.utcnow()
            _add_message(db, enquiry_id, sender="ai", content=matched_sop["response"])
            _add_timeline(
                db, enquiry_id, "sop_matched", f"Matched SOP: {matched_sop['name']}"
            )

            logger.info(
                "SOP matched",
                extra={"enquiry_id": enquiry_id, "sop": matched_sop["name"]},
            )

        else:
            # No SOP matched — auto-escalate
            enquiry.status = "escalated"
            enquiry.escalation_reason = (
                "No SOP matched for inbound message. Flagged for human review."
            )
            enquiry.updated_at = datetime.utcnow()
            _add_timeline(
                db, enquiry_id, "escalated", "Auto-escalated: no SOP match found"
            )

            logger.warning(
                "No SOP matched — auto-escalated",
                extra={
                    "enquiry_id": enquiry_id,
                    "escalation_reason": enquiry.escalation_reason,
                },
            )

            _add_message(
                db,
                enquiry_id,
                sender="ai",
                content="Your enquiry has been escalated to a human agent for further review.",
            )

        db.commit()
        logger.info("Background task complete", extra={"enquiry_id": enquiry_id})

    finally:
        db.close()


# helper functions
def _add_timeline(db: Session, enquiry_id: str, status: str, note: str):
    entry = StatusTimeline(
        enquiry_id=enquiry_id, status=status, note=note, timestamp=datetime.utcnow()
    )
    db.add(entry)


def _add_message(db: Session, enquiry_id: str, sender: str, content: str):
    msg = Message(
        enquiry_id=enquiry_id,
        sender=sender,
        content=content,
        timestamp=datetime.utcnow(),
    )
    db.add(msg)
