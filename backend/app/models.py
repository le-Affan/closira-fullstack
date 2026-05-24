# this contains 4 tables: enquries, status_timeline and followups

from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(String, primary_key=True, default=generate_uuid)
    customer_name = Column(String, nullable=False)
    channel = Column(String, nullable=False) # whatsapp, email or call
    message = Column(Text, nullable=False)
    status = Column(String, default="new") # new, processing, sop_matched or escalated
    sop_match = Column(String, nullable=True) # # name of the matched SOP
    suggested_response = Column(Text, nullable=True)
    escalation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    messages = relationship("Message", back_populates="enquiry", cascade="all, delete")
    timeline = relationship("StatusTimeline", back_populates="enquiry", cascade="all, delete")
    followups = relationship("FollowUp", back_populates="enquiry", cascade="all, delete")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    enquiry_id = Column(String, ForeignKey("enquiries.id"), nullable=False)
    sender = Column(String, nullable=False) # customer, agent or ai
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    enquiry = relationship("Enquiry", back_populates="messages")


class StatusTimeline(Base):
    __tablename__ = "status_timeline"
    id = Column(String, primary_key=True, default=generate_uuid)
    enquiry_id = Column(String, ForeignKey("enquiries.id"), nullable=False)
    status = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    enquiry = relationship("Enquiry", back_populates="timeline")


class FollowUp(Base):
    __tablename__ = "followups"
    id = Column(String, primary_key=True, default=generate_uuid)
    enquiry_id = Column(String, ForeignKey("enquiries.id"), nullable=False)
    scheduled_at = Column(DateTime, nullable=False)
    message_template = Column(Text, nullable=True)
    done = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    enquiry = relationship("Enquiry", back_populates="followups")