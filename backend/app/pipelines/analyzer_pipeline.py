import time
import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.processors.validator import validate_uploaded_file
from app.processors.extractor import extract_content
from app.processors.profiler import build_input_profile
from app.pipelines.selection_engine import ModuleSelectionEngine
from app.pipelines.dependency_engine import DependencyEngine
from app.module_registry.registry import MODULE_REGISTRY
from app.report_engine.generator import DynamicReportGenerator
from app.report_engine.exporters import ReportExporter
from app.database.models import (
    DBDocument,
    DBInputProfile,
    DBAnalysis,
    DBModuleResult,
    DBReport,
    DBReportSection,
    DBProcessingLog
)

def analyze_document(
    file_path: str,
    filename: str,
    user_id: Optional[int] = None,
    manual_module_ids: Optional[List[str]] = None,
    db: Optional[Session] = None
) -> Dict[str, Any]:
    """
    Master pipeline executing the intelligent document analysis.
    """
    pipeline_start = time.time()
    logs: List[Dict[str, str]] = []

    def log(level: str, msg: str):
        logs.append({"level": level, "message": msg, "time": time.strftime("%H:%M:%S")})

    # 1. Validation
    log("INFO", f"Validating input file '{filename}'...")
    validation = validate_uploaded_file(file_path, filename)
    if not validation.get("is_valid"):
        raise ValueError(validation.get("error", "File validation failed"))

    # 2. Content Extraction & OCR
    file_type = validation["file_type"]
    file_cat = validation["file_category"]
    log("INFO", f"Detected format '{file_type}' ({file_cat}). Extracting content & OCR features...")
    extracted_data = extract_content(file_path, file_type, file_cat)

    # 3. Input Profiling
    log("INFO", "Profiling document characteristics, language, layout, and complexity...")
    input_profile = build_input_profile(validation, extracted_data)
    doc_type = input_profile["document_type"]
    log("SUCCESS", f"Input profiled: Document Type = '{doc_type}', Pages = {input_profile['pages']}, Language = {input_profile['language']}")

    # 4. Dynamic Module Selection
    mode = "manual" if manual_module_ids else "auto"
    log("INFO", f"Selecting applicable modules (Mode: {mode.upper()})...")
    applicable_modules, skipped_modules = ModuleSelectionEngine.select_modules(
        input_profile,
        manual_module_ids=manual_module_ids
    )
    log("INFO", f"Catalog evaluation: {len(applicable_modules)} applicable modules selected, {len(skipped_modules)} modules skipped.")

    # 5. Dependency Ordering
    ordered_modules = DependencyEngine.resolve_execution_order(applicable_modules)

    # 6. Module Execution
    log("INFO", f"Executing {len(ordered_modules)} modules with fault isolation...")
    module_results: List[Dict[str, Any]] = []
    
    # Prepare payload for modules
    module_payload = {
        "file_path": file_path,
        "filename": filename,
        "file_type": file_type,
        "file_category": file_cat,
        "text": extracted_data.get("text", ""),
        "pages": extracted_data.get("pages", 1),
        "tables": extracted_data.get("tables", []),
        "rows": extracted_data.get("rows", 0),
        "columns": extracted_data.get("columns", 0),
        "column_names": extracted_data.get("column_names", []),
        "numeric_columns": extracted_data.get("numeric_columns", []),
        "categorical_columns": extracted_data.get("categorical_columns", []),
        "missing_values_count": extracted_data.get("missing_values_count", 0),
        "image_meta": input_profile.get("image_meta"),
        "layout": extracted_data.get("layout", {})
    }

    for mod in ordered_modules:
        res = mod.run(module_payload)
        module_results.append(res.model_dump())

    completed_count = sum(1 for r in module_results if r.get("status") == "completed")
    failed_count = sum(1 for r in module_results if r.get("status") == "failed")
    total_latency = time.time() - pipeline_start
    log("SUCCESS", f"Module execution finished: {completed_count} completed, {failed_count} failed in {round(total_latency, 2)}s.")

    # 7. AI Report Generation
    log("INFO", "Synthesizing dynamic 18-section AI analysis report...")
    report = DynamicReportGenerator.generate_report(
        input_profile=input_profile,
        module_results=module_results,
        skipped_modules=skipped_modules,
        total_time=total_latency
    )

    # 8. Multi-format Exports
    log("INFO", "Generating multi-format report exports (PDF, DOCX, HTML, JSON, CSV, TXT)...")
    exports = ReportExporter.export_all(report, filename)

    # 9. Database Persistence (if session provided)
    analysis_id = None
    if db:
        try:
            db_doc = DBDocument(
                user_id=user_id,
                filename=filename,
                file_path=file_path,
                file_size=validation["file_size"],
                mime_type=validation["mime_type"],
                file_type=file_type
            )
            db.add(db_doc)
            db.flush()

            db_profile = DBInputProfile(
                document_id=db_doc.id,
                profile_json=json.dumps(input_profile)
            )
            db.add(db_profile)

            db_analysis = DBAnalysis(
                document_id=db_doc.id,
                user_id=user_id,
                status="completed",
                mode=mode,
                total_modules=450,
                applicable_count=len(applicable_modules),
                completed_count=completed_count,
                skipped_count=len(skipped_modules),
                failed_count=failed_count,
                execution_time=round(total_latency, 3)
            )
            db.add(db_analysis)
            db.flush()
            analysis_id = db_analysis.id

            # Save individual module results
            for r in module_results:
                db_res = DBModuleResult(
                    analysis_id=db_analysis.id,
                    module_id=r.get("module_id", ""),
                    module_name=r.get("module_name", ""),
                    category=r.get("category", ""),
                    status=r.get("status", "completed"),
                    confidence=r.get("confidence", 0.9),
                    result_json=json.dumps(r.get("result", {})),
                    visualization_json=json.dumps(r.get("visualization")) if r.get("visualization") else None,
                    explanation=r.get("explanation", ""),
                    execution_time=r.get("execution_time", 0.0),
                    error_message=", ".join(r.get("errors", [])) if r.get("errors") else None
                )
                db.add(db_res)

            # Save report
            db_report = DBReport(
                analysis_id=db_analysis.id,
                document_id=db_doc.id,
                title=report.get("title", ""),
                summary=report["sections"][0]["content"] if report.get("sections") else "",
                full_report_json=json.dumps(report)
            )
            db.add(db_report)
            db.flush()

            # Save report sections
            for sec in report.get("sections", []):
                db_sec = DBReportSection(
                    report_id=db_report.id,
                    section_index=sec.get("index", 1),
                    section_title=sec.get("title", ""),
                    content_json=json.dumps(sec.get("content"))
                )
                db.add(db_sec)

            # Save logs
            for l in logs:
                db_log = DBProcessingLog(
                    analysis_id=db_analysis.id,
                    level=l["level"],
                    message=l["message"]
                )
                db.add(db_log)

            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error persisting analysis to database: {e}")

    return {
        "analysis_id": analysis_id,
        "input_profile": input_profile,
        "selected_modules": [m.module_id for m in applicable_modules],
        "completed_modules": completed_count,
        "skipped_modules": skipped_modules,
        "failed_modules": failed_count,
        "module_results": module_results,
        "summary": report["sections"][0]["content"] if report.get("sections") else "",
        "report": report,
        "exports": exports,
        "logs": logs
    }

def execute_single_module(
    module_id_or_number: Any,
    file_path: str,
    filename: str
) -> Dict[str, Any]:
    """
    Executes a single specified module out of the 450 projects on a user-uploaded file.
    Directly satisfies User Requirement #37:
    'in 450 module each should have the like uploading the input make the thing for the all the projects'
    """
    start_time = time.time()

    # Find module
    mod = None
    if isinstance(module_id_or_number, int) or (isinstance(module_id_or_number, str) and module_id_or_number.isdigit()):
        mod = MODULE_REGISTRY.get_by_number(int(module_id_or_number))
    elif isinstance(module_id_or_number, str):
        mod = MODULE_REGISTRY.get(module_id_or_number)

    if not mod:
        raise ValueError(f"Module '{module_id_or_number}' not found in 450+ module registry")

    validation = validate_uploaded_file(file_path, filename)
    file_type = validation.get("file_type", "document")
    file_cat = validation.get("file_category", "document")
    extracted_data = extract_content(file_path, file_type, file_cat)
    input_profile = build_input_profile(validation, extracted_data)

    payload = {
        "file_path": file_path,
        "filename": filename,
        "file_type": file_type,
        "file_category": file_cat,
        "text": extracted_data.get("text", ""),
        "pages": extracted_data.get("pages", 1),
        "tables": extracted_data.get("tables", []),
        "rows": extracted_data.get("rows", 0),
        "columns": extracted_data.get("columns", 0),
        "column_names": extracted_data.get("column_names", []),
        "numeric_columns": extracted_data.get("numeric_columns", []),
        "categorical_columns": extracted_data.get("categorical_columns", []),
        "missing_values_count": extracted_data.get("missing_values_count", 0),
        "image_meta": input_profile.get("image_meta"),
        "layout": extracted_data.get("layout", {})
    }

    result = mod.run(payload)
    elapsed = time.time() - start_time

    return {
        "module_id": mod.module_id,
        "module_name": mod.module_name,
        "category": mod.category,
        "project_number": getattr(mod, "number", None),
        "filename": filename,
        "input_profile": input_profile,
        "execution_time": round(elapsed, 4),
        "result": result.model_dump()
    }
