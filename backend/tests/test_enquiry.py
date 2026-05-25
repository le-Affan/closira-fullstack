from app.database import Base, get_db
from app.main import app
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Using a separate in-memory SQLite DB for tests
TEST_DATABASE_URL = "sqlite:///./test_closira.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()

    try:
        yield db

    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


# Helpers
def create_sample_enquiry(message="I'd like to book an appointment"):
    return client.post(
        "/enquiry/",
        json={
            "customer_name": "Test User",
            "channel": "whatsapp",
            "message": message,
        },
    )


# Health
def test_health_check():
    res = client.get("/health")

    assert res.status_code == 200

    data = res.json()

    assert data["status"] == "ok"
    assert data["database"] == "connected"


def test_create_enquiry_returns_job_id():
    res = create_sample_enquiry()

    assert res.status_code == 202

    data = res.json()

    assert "job_id" in data
    # The route returns immediately with status="queued"; the background task
    # runs after the response and updates the status to processing/sop_matched.
    assert data["status"] == "queued"


def test_create_enquiry_missing_field():
    res = client.post(
        "/enquiry/",
        json={
            "customer_name": "Test User",
            "channel": "whatsapp",
            # message missing
        },
    )

    assert res.status_code == 422


def test_create_enquiry_invalid_channel():
    res = client.post(
        "/enquiry/",
        json={
            "customer_name": "Test User",
            "channel": "telegram",  # not a valid channel
            "message": "Hello",
        },
    )

    assert res.status_code == 422


def test_get_history_returns_data():
    res = create_sample_enquiry()

    job_id = res.json()["job_id"]

    history = client.get(f"/enquiry/{job_id}/history")

    assert history.status_code == 200

    data = history.json()

    assert data["id"] == job_id
    assert data["customer_name"] == "Test User"
    assert "messages" in data
    assert "timeline" in data


def test_history_contains_customer_message():
    """Regression test: customer's original message must appear in history messages."""
    res = create_sample_enquiry("I'd like to book an appointment")
    job_id = res.json()["job_id"]

    history = client.get(f"/enquiry/{job_id}/history")
    assert history.status_code == 200

    messages = history.json()["messages"]
    assert len(messages) >= 1, "Expected at least the customer message"

    senders = [m["sender"] for m in messages]
    assert "customer" in senders, "Customer's original message must appear in history"

    customer_msg = next(m for m in messages if m["sender"] == "customer")
    assert "book" in customer_msg["content"].lower()


def test_get_history_not_found():
    res = client.get("/enquiry/nonexistent-id/history")

    assert res.status_code == 404


def test_schedule_followup():
    res = create_sample_enquiry()

    job_id = res.json()["job_id"]

    followup = client.post(
        f"/enquiry/{job_id}/followup",
        json={
            "delay_minutes": 30,
            "message_template": "Hi {name}, following up!",
        },
    )

    assert followup.status_code == 201

    data = followup.json()

    assert data["enquiry_id"] == job_id
    assert data["done"] is False


def test_followup_not_found():
    res = client.post(
        "/enquiry/bad-id/followup",
        json={"delay_minutes": 10},
    )

    assert res.status_code == 404


def test_escalate_enquiry():
    res = create_sample_enquiry()

    job_id = res.json()["job_id"]

    escalate = client.post(
        f"/enquiry/{job_id}/escalate",
        json={
            "reason": "Customer is requesting a manager.",
        },
    )

    assert escalate.status_code == 200

    data = escalate.json()

    assert data["status"] == "escalated"
    assert "manager" in data["escalation_reason"]


def test_escalate_already_escalated():
    res = create_sample_enquiry()

    job_id = res.json()["job_id"]

    client.post(
        f"/enquiry/{job_id}/escalate",
        json={"reason": "First escalation"},
    )

    second = client.post(
        f"/enquiry/{job_id}/escalate",
        json={"reason": "Second attempt"},
    )

    assert second.status_code == 400


def test_escalate_not_found():
    res = client.post(
        "/enquiry/bad-id/escalate",
        json={"reason": "test"},
    )

    assert res.status_code == 404
