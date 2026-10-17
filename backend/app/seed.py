import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.levels import PASS_THRESHOLD
from app.db import Base, SessionLocal, engine
from app.models import Case, Level, LevelProgress

DEFAULT_LEVELS = [
    {
        "number": 1,
        "title": "Foundation",
        "pass_threshold": PASS_THRESHOLD,
        "certificate_threshold": None,
    },
    {
        "number": 2,
        "title": "Developing Advocate",
        "pass_threshold": PASS_THRESHOLD,
        "certificate_threshold": None,
    },
    {
        "number": 3,
        "title": "Practicing Advocate",
        "pass_threshold": PASS_THRESHOLD,
        "certificate_threshold": None,
    },
    {
        "number": 4,
        "title": "Advanced Advocate",
        "pass_threshold": PASS_THRESHOLD,
        "certificate_threshold": None,
    },
    {
        "number": 5,
        "title": "Courtroom Proficiency",
        "pass_threshold": PASS_THRESHOLD,
        "certificate_threshold": None,
    },
]


def seed(db: Session | None = None) -> dict[str, int]:
    """
    Creates levels 1 to 5 and loads all JSON case files from backend/app/data/cases/
    into the Case table.
    Removes any Level 6 rows from Level and LevelProgress tables.
    Converts any existing LOCKED or UNLOCKED rows to NOT_STARTED.
    Safe to execute multiple times (idempotent).
    """
    Base.metadata.create_all(bind=engine)
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    stats = {
        "deleted_level_rows": 0,
        "deleted_level_progress_rows": 0,
        "converted_level_progress_rows": 0,
    }

    try:
        # 1. Clean up level 6 rows
        del_lvl = db.query(Level).filter(Level.number == 6).delete()
        del_lp = db.query(LevelProgress).filter(LevelProgress.level_number == 6).delete()
        stats["deleted_level_rows"] = del_lvl
        stats["deleted_level_progress_rows"] = del_lp

        # 2. Convert existing LOCKED or UNLOCKED rows to NOT_STARTED
        conv_lp = (
            db.query(LevelProgress)
            .filter(LevelProgress.status.in_(["LOCKED", "UNLOCKED"]))
            .update({LevelProgress.status: "NOT_STARTED"}, synchronize_session=False)
        )
        stats["converted_level_progress_rows"] = conv_lp

        # 3. Seed or update Levels 1 to 5
        for lvl_info in DEFAULT_LEVELS:
            existing_lvl = db.query(Level).filter(Level.number == lvl_info["number"]).first()
            if existing_lvl:
                existing_lvl.title = lvl_info["title"]
                existing_lvl.pass_threshold = lvl_info["pass_threshold"]
                existing_lvl.certificate_threshold = lvl_info["certificate_threshold"]
            else:
                db.add(
                    Level(
                        number=lvl_info["number"],
                        title=lvl_info["title"],
                        pass_threshold=lvl_info["pass_threshold"],
                        certificate_threshold=lvl_info["certificate_threshold"],
                    )
                )

        # 4. Seed or update Cases from JSON files
        cases_dir = Path(__file__).resolve().parent / "data" / "cases"
        if cases_dir.exists():
            for json_file in cases_dir.glob("*.json"):
                with open(json_file, "r", encoding="utf-8") as f:
                    case_data = json.load(f)

                slug = case_data.get("slug") or json_file.stem
                title = case_data.get("title", slug.replace("_", " ").title())
                jurisdiction = case_data.get("jurisdiction", "Demo jurisdiction")
                domain_slug = case_data.get("domain_slug", "contract")
                level_number = case_data.get("level_number", 1)
                case_json_str = json.dumps(case_data)

                existing_case = db.query(Case).filter(Case.slug == slug).first()
                if existing_case:
                    existing_case.title = title
                    existing_case.jurisdiction = jurisdiction
                    existing_case.domain_slug = domain_slug
                    existing_case.level_number = level_number
                    existing_case.case_json = case_json_str
                else:
                    db.add(
                        Case(
                            slug=slug,
                            title=title,
                            jurisdiction=jurisdiction,
                            domain_slug=domain_slug,
                            level_number=level_number,
                            case_json=case_json_str,
                        )
                    )

        db.commit()
        return stats
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    result = seed()
    print("Database seeding completed successfully:", result)
