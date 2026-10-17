import argparse
import sys
from pathlib import Path

# Ensure backend root is in sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.core.roles import ROLE_ADMIN
from app.db import SessionLocal
from app.models import User


def make_admin(email: str, db=None) -> bool:
    """
    Promotes the user with the specified email to the admin role.
    Returns True if user was found and updated, False otherwise.
    """
    normalized = email.lower().strip()
    owns_session = False
    if db is None:
        db = SessionLocal()
        owns_session = True

    try:
        user = db.query(User).filter(User.email == normalized).first()
        if not user:
            print(f"Error: User with email '{email}' not found.")
            return False

        user.role = ROLE_ADMIN
        db.commit()
        db.refresh(user)
        print(f"Success: User '{user.email}' (id: {user.id}) promoted to {ROLE_ADMIN}.")
        return True
    finally:
        if owns_session:
            db.close()


def main():
    parser = argparse.ArgumentParser(description="Courtly management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    make_admin_parser = subparsers.add_parser("make-admin", help="Promote a user to admin")
    make_admin_parser.add_argument("email", type=str, help="Email of the user to promote")

    args = parser.parse_args()

    if args.command == "make-admin":
        success = make_admin(args.email)
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
