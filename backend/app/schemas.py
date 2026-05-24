from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

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
    customer_name: str = Field(..., example="Sarah M.", description="Full name of the customer")
    channel: ChannelEnum = Field(..., example="whatsapp", description="Inbound channel")
    message: str = Field(..., example="Hi, I'd like to book an appointment for next week.", description="Customer's message")

class EnquiryCreatedResponse(BaseModel):
    job_id: str = Field(..., description="The enquiry ID to track processing status")
    status: str = Field(default="processing")
    message: str = Field(default="Enquiry received. Processing in background.")
    
    class Config:
        from_attributes = True




# follow-up ----
class FollowUpCreate(BaseModel):
    delay_minutes: int = Field(..., ge=1, example=30, description="Minutes from now to schedule the follow-up")
    message_template: Optional[str] = Field(None, example="Hi {name}, just following up on your enquiry.")

class FollowUpResponse(BaseModel):
    id: str
    enquiry_id: str
    scheduled_at: datetime
    message_template: Optional[str]
    done: bool

    class Config:
        from_attributes = True




# esclation ----
class EscalateCreate(BaseModel):
    reason: str = Field(..., example="Customer is very unhappy and requesting a manager.", description="Reason for escalation")

class EscalateResponse(BaseModel):
    id: str
    status: str
    escalation_reason: str
    
    class Config:
        from_attributes = True




# history ----
class MessageOut(BaseModel):
    id: str
    sender: str
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
    
class TimelineOut(BaseModel):
    status: str
    note: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True
        
class EnquiryHistoryResponse(BaseModel):
    id: str
    customer_name: str
    channel: str
    status: str
    sop_match: Optional[str]
    suggested_response: Optional[str]
    escalation_reason: Optional[str]
    created_at: datetime
    messages: List[MessageOut]
    timeline: List[TimelineOut]

    class Config:
        from_attributes = True




# health ----
class HealthResponse(BaseModel):
    status: str
    database: str