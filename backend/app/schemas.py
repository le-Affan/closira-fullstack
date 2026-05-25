from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


# enums ----
class ChannelEnum(str, Enum):
    whatsapp = "whatsapp"
    email = "email"
    call = "call"


class StatusEnum(str, Enum):
    new = "new"
    processing = "processing"
    sop_matched = "sop_matched"
    escalated = "escalated"


class SenderEnum(str, Enum):
    customer = "customer"
    agent = "agent"
    ai = "ai"


# enquiry ----
class EnquiryCreate(BaseModel):
    customer_name: str = Field(
        ..., example="Sarah Mitchell", description="Full name of the customer"
    )
    channel: ChannelEnum = Field(
        ..., example="whatsapp", description="Inbound channel"
    )
    message: str = Field(
        ...,
        example="Hi, I'd like to book an appointment for next Thursday afternoon if possible.",
        description="Customer's inbound message",
    )


class EnquiryCreatedResponse(BaseModel):
    job_id: str = Field(
        example="e3b2a1d0-c4f5-4a6b-8e7d-9f0a1b2c3d4e",
        description="Enquiry ID — use this to poll status and retrieve history",
    )
    status: str = Field(
        default="queued",
        example="queued",
        description="Initial processing status; always 'queued' when first returned",
    )
    message: str = Field(
        default="Enquiry received and queued for processing.",
        example="Enquiry received and queued for processing.",
    )

    class Config:
        from_attributes = True


# follow-up ----
class FollowUpCreate(BaseModel):
    delay_minutes: int = Field(
        ...,
        ge=1,
        example=30,
        description="Minutes from now to schedule the follow-up",
    )
    message_template: Optional[str] = Field(
        None,
        example="Hi {name}, just following up on your enquiry from earlier. Do you have any questions?",
        description="Optional message template sent to the customer at follow-up time",
    )


class FollowUpResponse(BaseModel):
    id: str = Field(
        example="f1a2b3c4-d5e6-7890-abcd-ef1234567890",
        description="Unique follow-up record ID",
    )
    enquiry_id: str = Field(
        example="e3b2a1d0-c4f5-4a6b-8e7d-9f0a1b2c3d4e",
        description="Parent enquiry ID",
    )
    scheduled_at: datetime = Field(
        example="2026-05-25T10:30:00",
        description="UTC datetime when the follow-up is scheduled to fire",
    )
    message_template: Optional[str] = Field(
        example="Hi {name}, just following up on your enquiry from earlier. Do you have any questions?",
    )
    done: bool = Field(
        example=False,
        description="Whether the follow-up has been sent",
    )

    class Config:
        from_attributes = True


# escalation ----
class EscalateCreate(BaseModel):
    reason: str = Field(
        ...,
        example="Customer is requesting to speak directly with a senior manager regarding a billing dispute.",
        description="Human-readable reason for escalating to an agent",
    )


class EscalateResponse(BaseModel):
    id: str = Field(
        example="e3b2a1d0-c4f5-4a6b-8e7d-9f0a1b2c3d4e",
        description="Enquiry ID",
    )
    status: str = Field(
        example="escalated",
        description="Updated enquiry status",
    )
    escalation_reason: str = Field(
        example="Customer is requesting to speak directly with a senior manager regarding a billing dispute.",
        description="Reason recorded for the escalation",
    )

    class Config:
        from_attributes = True


# history ----
class MessageOut(BaseModel):
    id: str = Field(
        example="a1b2c3d4-e5f6-7890-abcd-ef0123456789",
        description="Message record ID",
    )
    sender: str = Field(
        example="customer",
        description="Who sent the message: 'customer', 'ai', or 'agent'",
    )
    content: str = Field(
        example="Hi, I'd like to book an appointment for next Thursday afternoon if possible.",
        description="Raw message content",
    )
    timestamp: datetime = Field(
        example="2026-05-25T06:24:08",
        description="UTC timestamp when the message was recorded",
    )

    class Config:
        from_attributes = True


class TimelineOut(BaseModel):
    status: str = Field(
        example="sop_matched",
        description="Status value at this point in time",
    )
    note: Optional[str] = Field(
        example="Matched SOP: Booking Enquiry",
        description="Human-readable note describing why this status was reached",
    )
    timestamp: datetime = Field(
        example="2026-05-25T06:24:09",
        description="UTC timestamp of this status transition",
    )

    class Config:
        from_attributes = True


class EnquiryHistoryResponse(BaseModel):
    id: str = Field(
        example="e3b2a1d0-c4f5-4a6b-8e7d-9f0a1b2c3d4e",
        description="Unique enquiry ID",
    )
    customer_name: str = Field(
        example="Sarah Mitchell",
        description="Full name of the customer who sent the enquiry",
    )
    channel: str = Field(
        example="whatsapp",
        description="Channel the enquiry arrived on",
    )
    status: str = Field(
        example="sop_matched",
        description="Current processing status of the enquiry",
    )
    sop_match: Optional[str] = Field(
        example="Booking Enquiry",
        description="Name of the matched Standard Operating Procedure, if any",
    )
    suggested_response: Optional[str] = Field(
        example=(
            "Thank you for reaching out. We'd be glad to book you in. "
            "Please let us know your preferred date and time and we'll confirm your appointment shortly."
        ),
        description="AI-generated suggested response based on the matched SOP",
    )
    escalation_reason: Optional[str] = Field(
        example=None,
        description="Reason for escalation if the enquiry was escalated",
    )
    created_at: datetime = Field(
        example="2026-05-25T06:24:08",
        description="UTC timestamp when the enquiry was first received",
    )
    messages: List[MessageOut] = Field(
        description="Full chronological message thread: customer message first, then AI/agent replies",
    )
    timeline: List[TimelineOut] = Field(
        description="Complete status transition log for audit and debugging",
    )

    class Config:
        from_attributes = True

        json_schema_extra = {
            "example": {
                "id": "e3b2a1d0-c4f5-4a6b-8e7d-9f0a1b2c3d4e",
                "customer_name": "Sarah Mitchell",
                "channel": "whatsapp",
                "status": "sop_matched",
                "sop_match": "Booking Enquiry",
                "suggested_response": (
                    "Thank you for reaching out. We'd be glad to book you in. "
                    "Please let us know your preferred date and time and we'll confirm your appointment shortly."
                ),
                "escalation_reason": None,
                "created_at": "2026-05-25T06:24:08",
                "messages": [
                    {
                        "id": "a1b2c3d4-e5f6-7890-abcd-ef0123456789",
                        "sender": "customer",
                        "content": "Hi, I'd like to book an appointment for next Thursday afternoon if possible.",
                        "timestamp": "2026-05-25T06:24:08",
                    },
                    {
                        "id": "b2c3d4e5-f6a7-8901-bcde-f01234567890",
                        "sender": "ai",
                        "content": (
                            "Thank you for reaching out. We'd be glad to book you in. "
                            "Please let us know your preferred date and time and we'll confirm your appointment shortly."
                        ),
                        "timestamp": "2026-05-25T06:24:09",
                    },
                ],
                "timeline": [
                    {
                        "status": "queued",
                        "note": "Enquiry received",
                        "timestamp": "2026-05-25T06:24:08",
                    },
                    {
                        "status": "processing",
                        "note": "Background task started",
                        "timestamp": "2026-05-25T06:24:08",
                    },
                    {
                        "status": "sop_matched",
                        "note": "Matched SOP: Booking Enquiry",
                        "timestamp": "2026-05-25T06:24:09",
                    },
                ],
            }
        }


# health ----
class HealthResponse(BaseModel):
    status: str = Field(example="ok", description="API health status")
    database: str = Field(
        example="connected", description="Database connectivity status"
    )
