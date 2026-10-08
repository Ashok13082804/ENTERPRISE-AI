from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.db import get_session
from app.database.models import DBAnalysis, DBDocument, DBReport

router = APIRouter(prefix="/api/history", tags=["Analysis History"])

@router.get("")
def get_analysis_history(db: Session = Depends(get_session)):
    """
    Returns historical document analysis runs with statistics and links.
    """
    analyses = db.query(DBAnalysis).order_by(DBAnalysis.id.desc()).limit(50).all()
    history = []

    for a in analyses:
        doc = db.query(DBDocument).filter(DBDocument.id == a.document_id).first()
        report = db.query(DBReport).filter(DBReport.analysis_id == a.id).first()
        history.append({
            "analysis_id": a.id,
            "filename": doc.filename if doc else "Document",
            "file_type": doc.file_type.upper() if doc else "UNKNOWN",
            "file_size": doc.file_size if doc else 0,
            "status": a.status,
            "mode": a.mode,
            "applicable_modules": a.applicable_count,
            "completed_modules": a.completed_count,
            "skipped_modules": a.skipped_count,
            "failed_modules": a.failed_count,
            "execution_time": a.execution_time,
            "timestamp": a.created_at.strftime("%Y-%m-%d %H:%M:%S") if a.created_at else "Just now",
            "report_title": report.title if report else "Report"
        })

    return history
