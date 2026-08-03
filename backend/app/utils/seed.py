"""Database Seeder — Initial Data"""
from loguru import logger
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.notification import Notification
from sqlalchemy import select


async def seed_database():
    """Seed the database with initial demo data."""
    async with AsyncSessionLocal() as db:
        try:
            # Check if admin exists
            result = await db.execute(select(User).where(User.email == "admin@enterprise.ai"))
            existing = result.scalar_one_or_none()

            if not existing:
                # Create default users
                users = [
                    User(
                        email="admin@enterprise.ai",
                        username="admin",
                        employee_id="EMP001",
                        full_name="System Administrator",
                        hashed_password=hash_password("Admin@123"),
                        role="admin",
                        department="IT",
                        position="System Administrator",
                        is_active=True,
                        is_verified=True,
                        theme="dark",
                    ),
                    User(
                        email="manager@enterprise.ai",
                        username="manager",
                        employee_id="EMP002",
                        full_name="Sarah Johnson",
                        hashed_password=hash_password("Manager@123"),
                        role="manager",
                        department="Engineering",
                        position="Engineering Manager",
                        is_active=True,
                        is_verified=True,
                        theme="dark",
                    ),
                    User(
                        email="employee@enterprise.ai",
                        username="employee",
                        employee_id="EMP003",
                        full_name="Alex Chen",
                        hashed_password=hash_password("Employee@123"),
                        role="employee",
                        department="Engineering",
                        position="Senior Developer",
                        is_active=True,
                        is_verified=True,
                        theme="dark",
                    ),
                    User(
                        email="guest@enterprise.ai",
                        username="guest",
                        employee_id="EMP004",
                        full_name="Guest User",
                        hashed_password=hash_password("Guest@123"),
                        role="guest",
                        department="External",
                        position="Guest",
                        is_active=True,
                        is_verified=True,
                        theme="dark",
                    ),
                ]

                for user in users:
                    db.add(user)

                await db.flush()

                # Add welcome notifications for admin
                admin = (await db.execute(select(User).where(User.email == "admin@enterprise.ai"))).scalar_one()

                notifs = [
                    Notification(
                        user_id=admin.id,
                        title="🚀 Welcome to Enterprise AI Platform",
                        message="Your unified AI platform is ready. All systems are operational.",
                        type="success",
                        category="system",
                    ),
                    Notification(
                        user_id=admin.id,
                        title="🤖 Ollama Integration Active",
                        message="Connect to Ollama at http://localhost:11434 to enable AI features. Run: ollama pull llama3",
                        type="info",
                        category="ai",
                    ),
                    Notification(
                        user_id=admin.id,
                        title="🔐 Security Configuration",
                        message="Please change default passwords and configure MFA for all admin accounts.",
                        type="warning",
                        category="security",
                    ),
                ]

                for notif in notifs:
                    db.add(notif)

                await db.commit()
                logger.info("✅ Database seeded with demo users")
                logger.info("   admin@enterprise.ai / Admin@123")
                logger.info("   manager@enterprise.ai / Manager@123")
                logger.info("   employee@enterprise.ai / Employee@123")
                logger.info("   guest@enterprise.ai / Guest@123")
            else:
                logger.info("ℹ️  Database already seeded")

        except Exception as e:
            logger.error(f"Seed error: {e}")
            await db.rollback()
