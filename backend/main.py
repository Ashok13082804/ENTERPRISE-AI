"""
Unified Enterprise AI Platform
FastAPI Main Application Entry Point
"""
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.core.database import create_tables
from app.api.routes import (
    auth, users, chat, rag, documents, analytics,
    ml, vision, blockchain, nlp, admin, dashboard,
    projects, tasks, notifications, search, cybersecurity,
    notes, notes_ai, folders, tags
)
from app.api.routes import healthcare, legal, recruitment, banking, smartcity, education, agriculture
from app.api.routes.misc_modules import (
    insurance_router, ecommerce_router, resume_router,
    disaster_router, forensics_router, evoting_router
)
# Academic AI Modules
from app.api.routes import math, physics, chemistry, csverse, bioverse, calcverse, linguaverse
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.utils.seed import seed_database


# ─── Lifespan ───────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("🚀 Starting Unified Enterprise AI Platform...")
    
    # Check and install offline AI dependencies in background thread
    from app.utils.dependency_manager import check_and_install_all
    import threading
    threading.Thread(target=check_and_install_all, daemon=True).start()
    
    # Create directories
    for directory in ["uploads", "logs", "chroma_db", "models"]:
        Path(directory).mkdir(exist_ok=True)
    
    # Initialize database
    await create_tables()
    logger.info("✅ Database initialized")
    
    # Seed initial data
    await seed_database()
    logger.info("✅ Database seeded")

    # Initialize blockchain service
    from app.blockchain.blockchain_service import blockchain_service
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        await blockchain_service.initialize(session)
    logger.info("✅ Blockchain service initialized")
    
    logger.info(f"✅ Server ready at http://localhost:8000")
    logger.info(f"✅ API Docs at http://localhost:8000/docs")
    
    yield
    
    logger.info("🛑 Shutting down Enterprise AI Platform...")



# ─── App Factory ─────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Unified Enterprise AI Platform - All-in-One Intelligent Business Suite",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # ── Middleware ────────────────────────────────────────────────────────────
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RateLimitMiddleware, calls=settings.RATE_LIMIT_PER_MINUTE, period=60)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS.split(","),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Static Files ─────────────────────────────────────────────────────────
    Path("uploads").mkdir(exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

    # ── Routers ──────────────────────────────────────────────────────────────
    prefix = "/api/v1"
    app.include_router(auth.router,          prefix=f"{prefix}/auth",          tags=["Authentication"])
    app.include_router(users.router,         prefix=f"{prefix}/users",         tags=["Users"])
    app.include_router(chat.router,          prefix=f"{prefix}/chat",          tags=["AI Chat"])
    app.include_router(rag.router,           prefix=f"{prefix}/rag",           tags=["RAG"])
    app.include_router(documents.router,     prefix=f"{prefix}/documents",     tags=["Documents"])
    app.include_router(analytics.router,     prefix=f"{prefix}/analytics",     tags=["Analytics"])
    app.include_router(ml.router,            prefix=f"{prefix}/ml",            tags=["Machine Learning"])
    app.include_router(vision.router,        prefix=f"{prefix}/vision",        tags=["Computer Vision"])
    app.include_router(blockchain.router,    prefix=f"{prefix}/blockchain",    tags=["Blockchain"])
    app.include_router(nlp.router,           prefix=f"{prefix}/nlp",           tags=["NLP"])
    app.include_router(admin.router,         prefix=f"{prefix}/admin",         tags=["Admin"])
    app.include_router(dashboard.router,     prefix=f"{prefix}/dashboard",     tags=["Dashboard"])
    app.include_router(projects.router,      prefix=f"{prefix}/projects",      tags=["Projects"])
    app.include_router(tasks.router,         prefix=f"{prefix}/tasks",         tags=["Tasks"])
    app.include_router(notifications.router, prefix=f"{prefix}/notifications", tags=["Notifications"])
    app.include_router(search.router,        prefix=f"{prefix}/search",        tags=["Search"])
    app.include_router(cybersecurity.router, prefix=f"{prefix}/cybersecurity", tags=["Cybersecurity"])

    # Enterprise Modules
    app.include_router(healthcare.router,    prefix=f"{prefix}/healthcare",    tags=["Healthcare"])
    app.include_router(legal.router,         prefix=f"{prefix}/legal",         tags=["Legal AI"])
    app.include_router(recruitment.router,   prefix=f"{prefix}/recruitment",   tags=["Recruitment"])
    app.include_router(banking.router,       prefix=f"{prefix}/banking",       tags=["Banking"])
    app.include_router(smartcity.router,     prefix=f"{prefix}/smartcity",     tags=["Smart City"])
    app.include_router(education.router,     prefix=f"{prefix}/education",     tags=["Education"])
    app.include_router(agriculture.router,   prefix=f"{prefix}/agriculture",   tags=["Agriculture"])
    app.include_router(insurance_router,     prefix=f"{prefix}/insurance",     tags=["Insurance"])
    app.include_router(ecommerce_router,     prefix=f"{prefix}/ecommerce",     tags=["E-Commerce"])
    app.include_router(resume_router,        prefix=f"{prefix}/resume",        tags=["Resume Portal"])
    app.include_router(disaster_router,      prefix=f"{prefix}/disaster",      tags=["Disaster Management"])
    app.include_router(forensics_router,     prefix=f"{prefix}/forensics",     tags=["Digital Forensics"])
    app.include_router(evoting_router,       prefix=f"{prefix}/evoting",       tags=["E-Voting"])

    # Academic AI Modules
    app.include_router(math.router,          prefix=f"{prefix}/math",          tags=["MathVerse AI"])
    app.include_router(physics.router,       prefix=f"{prefix}/physics",       tags=["PhysicsVerse AI"])
    app.include_router(chemistry.router,     prefix=f"{prefix}/chemistry",     tags=["ChemVerse AI"])
    app.include_router(csverse.router,       prefix=f"{prefix}/csverse",       tags=["CSVerse AI"])
    app.include_router(bioverse.router,      prefix=f"{prefix}/bioverse",      tags=["BioVerse AI"])
    app.include_router(calcverse.router,     prefix=f"{prefix}/calcverse",     tags=["CalcVerse AI"])
    app.include_router(linguaverse.router,   prefix=f"{prefix}/linguaverse",   tags=["LinguaVerse AI"])

    # ── Smart Notes Module ────────────────────────────────────────────────────
    app.include_router(notes.router,         prefix=f"{prefix}/notes",         tags=["Smart Notes"])
    app.include_router(notes_ai.router,      prefix=f"{prefix}/notes/ai",      tags=["Notes AI"])
    app.include_router(folders.router,       prefix=f"{prefix}/folders",       tags=["Folders"])
    app.include_router(tags.router,          prefix=f"{prefix}/tags",          tags=["Tags"])

    # ── Health Check ─────────────────────────────────────────────────────────
    @app.get("/health", tags=["Health"])
    async def health_check():
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.APP_ENV,
        }

    @app.get("/", tags=["Root"])
    async def root():
        return {
            "message": "Unified Enterprise AI Platform API",
            "docs": "/docs",
            "health": "/health",
        }

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )
