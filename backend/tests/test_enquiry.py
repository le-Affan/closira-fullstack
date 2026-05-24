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
