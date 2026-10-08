import shutil
import json
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import UPLOAD_DIR, SAMPLES_DIR
from app.database.db import get_session
from app.database.models import DBAnalysis, DBReport, DBModuleResult
from app.pipelines.analyzer_pipeline import analyze_document

router = APIRouter(prefix="/api", tags=["Document Analyzer"])

@router.get("/samples")
def get_sample_files():
    """
    Returns available pre-packaged sample files for one-click testing.
    """
    samples = [
        {
            "id": "resume",
            "name": "Senior Deep Learning Engineer Resume",
            "filename": "sample_resume.txt",
            "file_type": "TXT",
            "category": "Document / NLP",
            "description": "Resume featuring deep learning skills, education, and ATS keywords."
        },
        {
            "id": "research_paper",
            "name": "Attention Networks Research Paper",
            "filename": "sample_research_paper.txt",
            "file_type": "TXT",
            "category": "Academic / Research",
            "description": "Formal research paper with abstract, methodology, datasets, and citations."
        },
        {
            "id": "financial_csv",
            "name": "Stock Market Volatility Dataset",
            "filename": "sample_financial_data.csv",
            "file_type": "CSV",
            "category": "Tabular / Finance",
            "description": "Financial time-series data with prices, returns, and volume."
        },
        {
            "id": "medical_xray",
            "name": "Chest Radiograph (X-Ray Scan)",
            "filename": "sample_medical_xray.png",
            "file_type": "PNG",
            "category": "Medical Deep Learning",
            "description": "Thoracic radiograph image for diagnostic opacity & lesion detection."
        },
        {
            "id": "invoice",
            "name": "Enterprise Software Tax Invoice",
            "filename": "sample_invoice.txt",
            "file_type": "TXT",
            "category": "Document AI / Forms",
            "description": "Commercial tax invoice with itemized charges and total balances."
        }
    ]
    return samples

@router.post("/analyze/sample/{sample_id}")
def analyze_sample(
    sample_id: str,
    mode: str = "auto",
    db: Session = Depends(get_session)
):
    sample_map = {
        "resume": "sample_resume.txt",
        "sample_resume.txt": "sample_resume.txt",
        "research_paper": "sample_research_paper.txt",
        "sample_research_paper.txt": "sample_research_paper.txt",
        "financial_csv": "sample_financial_data.csv",
        "sample_financial_data.csv": "sample_financial_data.csv",
        "medical_xray": "sample_medical_xray.png",
        "sample_medical_xray.png": "sample_medical_xray.png",
        "invoice": "sample_invoice.txt",
        "sample_invoice.txt": "sample_invoice.txt"
    }
    filename = sample_map.get(sample_id)
    if not filename:
        raise HTTPException(status_code=404, detail="Sample not found")

    sample_path = SAMPLES_DIR / filename
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail=f"Sample file {filename} not found on disk")

    try:
        result = analyze_document(
            file_path=str(sample_path),
            filename=filename,
            user_id=1,
            manual_module_ids=None,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def upload_and_analyze(
    file: UploadFile = File(...),
    mode: str = Form("auto"),
    modules: Optional[str] = Form(None),
    db: Session = Depends(get_session)
):
    """
    Uploads a document/image/dataset and executes the dynamic deep learning analysis pipeline.
    """
    safe_filename = file.filename or "uploaded_file"
    file_path = UPLOAD_DIR / safe_filename

    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    manual_module_ids = None
    if mode == "manual" and modules:
        try:
            manual_module_ids = json.loads(modules)
        except Exception:
            manual_module_ids = [m.strip() for m in modules.split(",") if m.strip()]

    try:
        result = analyze_document(
            file_path=str(file_path),
            filename=safe_filename,
            user_id=1,
            manual_module_ids=manual_module_ids,
            db=db
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analyses/{analysis_id}")
def get_analysis_detail(analysis_id: int, db: Session = Depends(get_session)):
    analysis = db.query(DBAnalysis).filter(DBAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    report = db.query(DBReport).filter(DBReport.analysis_id == analysis_id).first()
    module_results = db.query(DBModuleResult).filter(DBModuleResult.analysis_id == analysis_id).all()

    return {
        "analysis_id": analysis.id,
        "status": analysis.status,
        "mode": analysis.mode,
        "total_modules": analysis.total_modules,
        "applicable_count": analysis.applicable_count,
        "completed_count": analysis.completed_count,
        "skipped_count": analysis.skipped_count,
        "failed_count": analysis.failed_count,
        "execution_time": analysis.execution_time,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
        "report": json.loads(report.full_report_json) if report else None,
        "module_results": [
            {
                "module_id": r.module_id,
                "module_name": r.module_name,
                "category": r.category,
                "status": r.status,
                "confidence": r.confidence,
                "result": json.loads(r.result_json) if r.result_json else {},
                "visualization": json.loads(r.visualization_json) if r.visualization_json else None,
                "explanation": r.explanation,
                "execution_time": r.execution_time
            }
            for r in module_results
        ]
    }
