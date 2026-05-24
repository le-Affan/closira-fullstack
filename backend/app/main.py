from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.logger import get_logger
from app.routes import enquiry, health

# Create all tables on startup
Base.metadata.create_all(bind=engine)

logger = get_logger("main")

app = FastAPI(
    title="Closira Enquiry API",
    description=(
        "Backend service that simulates Closira's core customer enquiry-handling workflow."
        "Handles inbound enquiries, processes them asynchronously and exposes status, escalation, follow-up, and history endpoints."
    ),
    version="1.0",
)

# CORS is open for now cuz there's no auth
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(enquiry.router)
app.include_router(health.router)


@app.on_event("startup")
async def startup_event():
    logger.info("Closira API starting up")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Closira API shutting down")
