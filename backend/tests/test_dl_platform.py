import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.module_registry.registry import MODULE_REGISTRY
from app.pipelines.selection_engine import ModuleSelectionEngine
from app.pipelines.analyzer_pipeline import analyze_document, execute_single_module
from app.processors.validator import validate_uploaded_file
from app.processors.extractor import extract_content
from app.processors.profiler import build_input_profile
from app.core.config import SAMPLES_DIR

def test_module_registry_count():
    assert len(MODULE_REGISTRY) >= 450, f"Expected 450+ modules, found {len(MODULE_REGISTRY)}"
    m1 = MODULE_REGISTRY.get_by_number(1)
    assert m1 is not None, "Project #1 not found in registry"
    assert m1.module_id.startswith("CV-")
    
    m450 = MODULE_REGISTRY.get_by_number(450)
    assert m450 is not None, "Project #450 not found in registry"

def test_resume_analysis():
    sample_file = SAMPLES_DIR / "sample_resume.txt"
    assert sample_file.exists(), "Sample resume file missing"

    result = analyze_document(
        file_path=str(sample_file),
        filename="sample_resume.txt"
    )
    assert result is not None
    assert result["input_profile"]["document_type"] == "resume"
    assert result["completed_modules"] > 0
    assert len(result["skipped_modules"]) > 0
    assert result["report"] is not None
    assert len(result["report"]["sections"]) == 18
    assert "pdf" in result["exports"]
    assert "docx" in result["exports"]
    assert "html" in result["exports"]
    assert "json" in result["exports"]
    assert "csv" in result["exports"]
    assert "txt" in result["exports"]

def test_financial_csv_analysis():
    sample_file = SAMPLES_DIR / "sample_financial_data.csv"
    assert sample_file.exists()

    result = analyze_document(
        file_path=str(sample_file),
        filename="sample_financial_data.csv"
    )
    assert result["input_profile"]["document_type"] == "financial_dataset"
    assert result["completed_modules"] > 0

def test_medical_xray_analysis():
    sample_file = SAMPLES_DIR / "sample_medical_xray.png"
    assert sample_file.exists()

    result = analyze_document(
        file_path=str(sample_file),
        filename="sample_medical_xray.png"
    )
    assert result["input_profile"]["file_category"] == "image"
    assert result["completed_modules"] > 0

def test_single_module_execution_requirement_37():
    # Test executing module 1 (Handwritten Digit Recognition) with sample image
    sample_img = SAMPLES_DIR / "sample_medical_xray.png"
    res1 = execute_single_module(1, str(sample_img), "sample_medical_xray.png")
    assert res1["module_id"] == "CV-001"
    assert res1["result"]["status"] == "completed"

    # Test executing module 151 (NLP Sentiment / Sequence) with sample resume
    sample_txt = SAMPLES_DIR / "sample_resume.txt"
    res151 = execute_single_module(151, str(sample_txt), "sample_resume.txt")
    assert res151["module_id"].startswith("NLP-")
    assert res151["result"]["status"] == "completed"

def test_subproject_generator_and_zip():
    from app.services.subproject_generator import SubprojectGenerator
    res = SubprojectGenerator.generate_subproject(1)
    assert res["status"] == "generated"
    assert "src/model.py" in res["files_created"]
    assert "Dockerfile" in res["files_created"]

    zip_filename = SubprojectGenerator.create_subproject_zip(1)
    assert zip_filename.endswith(".zip")

    preview = SubprojectGenerator.preview_subproject(1)
    assert len(preview["files"]) >= 5

    prompt = SubprojectGenerator.generate_master_integration_prompt()
    assert "450+" in prompt and "DEEP LEARNING" in prompt
