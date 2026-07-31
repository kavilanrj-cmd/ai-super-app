from sqlalchemy import select
from app.core.config import settings
from app.core.database import async_session_factory
from app.core.security import hash_password
from app.models.user import User, UserRole


async def seed_admin():
    async with async_session_factory() as session:
        result = await session.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
        existing = result.scalar_one_or_none()
        if existing is None:
            admin = User(
                email=settings.ADMIN_EMAIL,
                username="admin",
                full_name="Default Admin",
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                is_verified=True,
                credits=999999,
            )
            session.add(admin)
            await session.commit()
            print(f"[seed] Default admin account created ({settings.ADMIN_EMAIL})")
        else:
            print("[seed] Default admin account already exists")
