"""Create (or promote) an admin user.

Usage (interactive, prompts for anything not passed as a flag):
    python -m app.create_admin

Usage (non-interactive, e.g. scripted on a server):
    python -m app.create_admin --name "Vikas" --email admin@vastraliya.com \
        --password "StrongPassword@123" --role ADMIN

If the email already exists, the existing user is promoted/updated instead
of failing with a duplicate-email error.
"""
import argparse
import getpass

from app.core.security import hash_password
from app.database.database import SessionLocal
from app.models.user import User, UserRole, UserStatus


def create_admin(name: str, email: str, password: str, phone: str | None, role: UserRole) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.name = name
            user.phone = phone or user.phone
            user.password_hash = hash_password(password)
            user.role = role
            user.status = UserStatus.ACTIVE
            db.commit()
            print(f"Updated existing user '{email}' -> role={role.value}, status=ACTIVE.")
            return

        user = User(
            name=name,
            email=email,
            phone=phone,
            password_hash=hash_password(password),
            role=role,
            status=UserStatus.ACTIVE,
        )
        db.add(user)
        db.commit()
        print(f"Created user '{email}' with role={role.value}.")
    finally:
        db.close()


def _prompt_password() -> str:
    while True:
        password = getpass.getpass("Password: ")
        if len(password) < 8:
            print("Password must be at least 8 characters.")
            continue
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Passwords do not match, try again.")
            continue
        return password


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or promote an admin user.")
    parser.add_argument("--name", help="Full name")
    parser.add_argument("--email", help="Login email")
    parser.add_argument("--phone", help="Phone number (optional)", default=None)
    parser.add_argument("--password", help="Password (will prompt securely if omitted)")
    parser.add_argument(
        "--role",
        choices=[r.value for r in UserRole],
        default=UserRole.SUPER_ADMIN.value,
        help="Role to assign (default: SUPER_ADMIN)",
    )
    args = parser.parse_args()

    name = args.name or input("Name: ").strip()
    email = args.email or input("Email: ").strip()
    phone = args.phone
    password = args.password or _prompt_password()
    role = UserRole(args.role)

    if not name or not email or not password:
        parser.error("name, email and password are all required.")

    create_admin(name, email, password, phone, role)


if __name__ == "__main__":
    main()
