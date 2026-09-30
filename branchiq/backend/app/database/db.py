"""
Database engine, session factory, and automatic seeding for AVENUE.
"""

from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


def get_db():
    """FastAPI dependency — yields a DB session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_initial_data(db) -> None:
    """Populates realistic demo banking data if the database is fresh."""
    from app.models.branch import Branch, Bottleneck, Recommendation, CustomerFeedback
    from ml.bottleneck_detection import detect_bottlenecks
    from ml.recommendation_engine import generate_recommendations

    if db.query(Branch).count() > 0:
        return

    # Seed 3 realistic bank branches in the city network
    branches = [
        Branch(
            id=1,
            branch_code="AV-CENTRAL",
            name="Avenue Downtown Flagship",
            location="742 Financial Way, Financial District",
            total_counters=8,
            active_counters=6,
            current_load=84,
            current_queue=26,
            avg_wait_minutes=28,
            staff_count=9,
            staff_utilization=91,
            csat_score=4.1,
            distance_miles=0.0,
            latitude=40.7128,
            longitude=-74.0060,
        ),
        Branch(
            id=2,
            branch_code="AV-NORTH",
            name="Avenue North Commerce Hub",
            location="128 Commerce Blvd, Tech Corridor",
            total_counters=6,
            active_counters=5,
            current_load=38,
            current_queue=6,
            avg_wait_minutes=8,
            staff_count=7,
            staff_utilization=52,
            csat_score=4.8,
            distance_miles=1.8,
            latitude=40.7380,
            longitude=-73.9900,
        ),
        Branch(
            id=3,
            branch_code="AV-WEST",
            name="Avenue Metro West Plaza",
            location="45 Metro Plaza, West End",
            total_counters=5,
            active_counters=4,
            current_load=58,
            current_queue=13,
            avg_wait_minutes=15,
            staff_count=6,
            staff_utilization=68,
            csat_score=4.4,
            distance_miles=3.2,
            latitude=40.7250,
            longitude=-74.0200,
        ),
    ]
    db.add_all(branches)
    db.commit()

    # Seed bottlenecks
    for b_code in ["AV-CENTRAL", "AV-NORTH", "AV-WEST"]:
        items = detect_bottlenecks(b_code)
        for it in items:
            b_obj = Bottleneck(
                branch_code=it["branch_code"],
                service_name=it["service_name"],
                severity=it["severity"],
                queue_length=it["queue_length"],
                avg_wait_minutes=it["avg_wait_minutes"],
                capacity_per_hour=it["capacity_per_hour"],
                staff_allocated=it["staff_allocated"],
                impact_reason=it["impact_reason"],
                recommended_action=it["recommended_action"],
            )
            db.add(b_obj)

    # Seed AI recommendations
    for b_code in ["AV-CENTRAL", "AV-NORTH", "AV-WEST"]:
        recs = generate_recommendations(b_code)
        for r in recs:
            rec_obj = Recommendation(
                id=r["id"],
                branch_code=r["branch_code"],
                action_type=r["action_type"],
                title=r["title"],
                description=r["description"],
                explanation=r["explanation"],
                priority=r["priority"],
                estimated_impact=r["estimated_impact"],
                applied=r.get("applied", False),
            )
            db.add(rec_obj)

    # Seed initial real-world feedback
    feedbacks = [
        CustomerFeedback(
            branch_code="AV-CENTRAL",
            customer_name="Michael Sterling",
            service_type="Loan & Mortgage",
            rating=2,
            comment="Central branch was packed today. Waited 45 minutes just to ask a question about mortgage refinancing! Need more loan specialists.",
            sentiment="negative",
            sentiment_score=-0.75,
            created_at=datetime.utcnow(),
        ),
        CustomerFeedback(
            branch_code="AV-NORTH",
            customer_name="Sarah Jenkins",
            service_type="Account Opening",
            rating=5,
            comment="The Avenue app suggested North Commerce branch instead of downtown. Saved almost half an hour! In and out in 10 minutes with friendly staff.",
            sentiment="positive",
            sentiment_score=0.92,
            created_at=datetime.utcnow(),
        ),
        CustomerFeedback(
            branch_code="AV-CENTRAL",
            customer_name="David Chen",
            service_type="Cash & Deposits",
            rating=5,
            comment="Cash counter was very swift, automated deposit took under 3 minutes. Flawless experience.",
            sentiment="positive",
            sentiment_score=0.85,
            created_at=datetime.utcnow(),
        ),
        CustomerFeedback(
            branch_code="AV-CENTRAL",
            customer_name="Elena Rostova",
            service_type="Wealth & Forex",
            rating=3,
            comment="Staff was knowledgeable and polite, but the KYC document processing felt delayed due to long lines.",
            sentiment="neutral",
            sentiment_score=0.10,
            created_at=datetime.utcnow(),
        ),
        CustomerFeedback(
            branch_code="AV-WEST",
            customer_name="Marcus Brody",
            service_type="General Banking",
            rating=4,
            comment="Moderate crowd at West Plaza but teller was courteous and resolved my wire transfer promptly.",
            sentiment="positive",
            sentiment_score=0.68,
            created_at=datetime.utcnow(),
        ),
    ]
    db.add_all(feedbacks)
    db.commit()


def init_db() -> None:
    """Create all tables and seed realistic demo data."""
    from app.models import branch  # noqa: F401
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
