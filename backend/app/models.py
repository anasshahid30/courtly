from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120))
    role: Mapped[str] = mapped_column(String(20), default="learner")


class Level(Base):
    __tablename__ = "levels"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(100))
    pass_threshold: Mapped[int] = mapped_column(Integer, default=85)
    certificate_threshold: Mapped[int | None] = mapped_column(Integer, nullable=True, default=None)


class Case(Base):
    __tablename__ = "cases"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    jurisdiction: Mapped[str] = mapped_column(String(100))
    domain_slug: Mapped[str] = mapped_column(String(100), index=True)
    level_number: Mapped[int] = mapped_column(Integer, index=True)
    case_json: Mapped[str] = mapped_column(Text)


class LevelProgress(Base):
    __tablename__ = "level_progress"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    level_number: Mapped[int] = mapped_column(Integer, index=True)
    status: Mapped[str] = mapped_column(String(50), default="NOT_STARTED")  # NOT_STARTED, IN_PROGRESS, PASSED
    best_score: Mapped[float | None] = mapped_column(Float, nullable=True, default=None)
    attempts: Mapped[int] = mapped_column(Integer, default=0)


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    case_slug: Mapped[str] = mapped_column(String(100), index=True)
    level_number: Mapped[int] = mapped_column(Integer, index=True)
    status: Mapped[str] = mapped_column(String(50), default="IN_PROGRESS")  # IN_PROGRESS or COMPLETED
    current_stage: Mapped[int] = mapped_column(Integer, default=0)  # 0 to 5
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )


class SessionScore(Base):
    __tablename__ = "session_scores"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), index=True)
    criterion_code: Mapped[str] = mapped_column(String(100), index=True)
    score: Mapped[float] = mapped_column(Float)
    explanation: Mapped[str] = mapped_column(Text, default="")


class Turn(Base):
    __tablename__ = "turns"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), index=True)
    sequence_no: Mapped[int] = mapped_column(Integer)
    speaker_type: Mapped[str] = mapped_column(String(50))  # learner, judge, opposing_counsel, witness
    stage_index: Mapped[int] = mapped_column(Integer, default=0)  # 0 to 5
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )


class Objection(Base):
    __tablename__ = "objections"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), index=True)
    turn_id: Mapped[int] = mapped_column(ForeignKey("turns.id"), index=True)
    objection_type: Mapped[str] = mapped_column(String(50))  # hearsay, leading, relevance, speculation, argumentative, other
    grounds: Mapped[str] = mapped_column(Text)
    ruling: Mapped[str] = mapped_column(String(50), default="pending")  # pending, sustained, overruled
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )


class Certificate(Base):
    __tablename__ = "certificates"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    score: Mapped[float] = mapped_column(Float)
    verification_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    issued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )


class Appeal(Base):
    __tablename__ = "appeals"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    reason: Mapped[str] = mapped_column(String(1000))
    status: Mapped[str] = mapped_column(String(50), default="open")  # open, upheld, rejected
    resolution_note: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

