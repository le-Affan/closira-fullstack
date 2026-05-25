# Closira Backend

A REST API that simulates Closira's inbound enquiry-handling pipeline. Customers send messages via WhatsApp, email, or call and the API accepts them, processes them asynchronously against a set of SOPs, and either generates a suggested response or escalates to a human agent.

Built with FastAPI + SQLite.

---

## Getting Started

```bash
git clone https://github.com/le-Affan/closira-fullstack
cd closira-fullstack/backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

---

## Project Structure

```
backend/
├── app/
│   ├── main.py          # app entry point
│   ├── database.py      # SQLAlchemy setup
│   ├── models.py        # DB table definitions
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── logger.py        # JSON structured logger
│   ├── routes/
│   │   ├── enquiry.py   # all enquiry endpoints
│   │   └── health.py    # health check
│   └── tasks/
│       └── sop_matcher.py  # background processing logic
├── tests/
│   └── test_enquiry.py
├── api_tests.sh
├── requirements.txt
└── README.md
```

---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/enquiry/` | Create a new inbound enquiry |
| `POST` | `/enquiry/{id}/followup` | Schedule a follow-up |
| `POST` | `/enquiry/{id}/escalate` | Escalate to a human agent |
| `GET` | `/enquiry/{id}/history` | Full conversation history + status timeline |
| `GET` | `/health` | API + database health check |

Full request/response examples are in the Swagger docs at `/docs`.

---

## How It Works

When a new enquiry comes in, the API returns a `job_id` immediately and fires a background task. That task runs keyword matching against 5 hardcoded SOPs:

| SOP | Trigger keywords |
|-----|-----------------|
| Booking Enquiry | book, appointment, schedule, reserve |
| Pricing Question | price, cost, quote, fee, how much |
| Complaint | complaint, unhappy, refund, angry, upset |
| After-Hours | closed, after hours, tomorrow, when do you open |
| General Follow-Up | follow up, any update, checking in, status |

If a match is found, the enquiry gets a suggested response and moves to `sop_matched`. If nothing matches, it auto-escalates and flags for human review.

Enquiry lifecycle: `queued → processing → sop_matched / escalated`

---

## Database

I went with SQLite over PostgreSQL for this prototype as it requires zero setup, ships in the repo, works fine for a single-process environment. In production I'd swap it for PostgreSQL to handle concurrent writes, connection pooling and proper multi-tenant isolation.

My schema has 4 tables `enquiries`, `messages`, `status_timeline`, `followups`. Each enquiry owns its messages and timeline events so the full conversation history is always reconstructable from a single query.

---

## BackgroundTasks vs Celery

I chose FastAPI's built-in `BackgroundTasks` instead of Celery. For this scope, Celery would mean spinning up a Redis broker and a separate worker process for no real benefit. `BackgroundTasks` keeps everything in one process and the setup stays simple.

The trade-off being tasks don't survive a server restart and there's no retry logic. In production, I'd move to Celery or something similar once the system needs distributed workers, persistent queues or external monitoring.

---

## Running Tests

```bash
pytest tests/ -v
```

Covers health check, enquiry creation, validation errors, follow-up scheduling, escalation flow, history retrieval, and auto-escalation on no SOP match.

---

## Known Limitations

- No auth as it is out of scope for this prototype
- No tenant isolation. It is a single-tenant setup, `tenant_id` would be the first thing I'd add in production
- Follow-ups are stored but not dispatched as there's no scheduler running. That would need APScheduler or a Celery beat worker
- SQLite won't handle concurrent writes at scale. I felt that is acceptable here but definitely not in production
- Background tasks don't survive restarts. Acknowledged Celery trade-off above
- No Docker setup. I would add a Dockerfile and docker-compose for easier onboarding in production
```

Built by Affan — [github.com/le-Affan](https://github.com/le-Affan)
