# ==============================================================================
# MASTER INTEGRATION PROMPT: 450+ DEEP LEARNING ANALYSIS PLATFORM (SUBPROJECT SPEC)
# ==============================================================================
# Use this comprehensive prompt to integrate, embed, or rebuild the entire 450-module 
# Deep Learning Document Analysis Platform into any parent project or repository.
# ==============================================================================

You are tasked with integrating or building the production-ready **450+ Module AI Deep Learning Document Analysis Platform** as a modular subproject inside this application.

## 1. SUBPROJECT ROLE & OBJECTIVE
The subproject acts as an intelligent, autonomous Deep Learning & Document Intelligence engine. It must:
1. Ingest any uploaded input (PDF, DOCX, TXT, CSV, XLSX, PPTX, JSON, XML, Images, Audio, ZIP).
2. Validate and detect magic bytes, MIME types, and file modalities.
3. Extract content (text, tables, image contours, Laplacian blur variance, speech signals).
4. Run an Input Profiler to identify Document Type (Resume, Research Paper, Invoice, Financial Dataset, Medical Scan, etc.), language, and complexity.
5. Dynamically evaluate the 450+ module catalog and activate ONLY applicable modules (e.g. 150 modules for Resumes, 180 for Financial CSVs, 430 for Medical Scans) while skipping irrelevant ones with clear explanations.
6. Execute modules with per-module error isolation (a failing module must never crash the pipeline).
7. Synthesize an authentic, dynamic 18-section AI Report.
8. Generate interactive visualizations (Bar, Pie, Radar, Line charts).
9. Export reports in 6 formats: PDF, DOCX, HTML, JSON, CSV, and TXT.
10. Allow every single one of the 450 projects to be executed independently with custom file uploads via an interactive workbench.

---

## 2. THE 17 CURATED DOMAINS & 450 DEEP LEARNING MODULES
The platform covers 450 verified, distinct deep learning subprojects:

- **Computer Vision — CNN**: 50 projects
- **Object Detection — YOLO**: 50 projects
- **Medical Deep Learning**: 50 projects
- **NLP + LSTM/GRU**: 50 projects
- **Transformers / BERT**: 25 projects
- **Speech + Audio Deep Learning**: 20 projects
- **Time-Series Deep Learning**: 20 projects
- **Cybersecurity + Deep Learning**: 20 projects
- **Agriculture + Deep Learning**: 20 projects
- **Education + Deep Learning**: 20 projects
- **Finance + Deep Learning**: 15 projects
- **GAN Projects**: 20 projects
- **Autoencoder Projects**: 20 projects
- **U-Net / Segmentation**: 20 projects
- **Robotics + Deep Learning**: 15 projects
- **Multimodal Deep Learning**: 15 projects
- **Video Deep Learning**: 20 projects

### Standard Module Schema:
Each module must inherit from a common `AnalysisModule` interface:
```python
class AnalysisModule:
    module_id: str
    module_name: str
    category: str
    description: str
    supported_inputs: list[str]  # ["text", "image", "tabular", "audio", "document"]
    
    def is_applicable(self, input_profile: dict) -> bool:
        ...
        
    def execute(self, data: dict, context=None) -> dict:
        ...
        
    def format_result(self, raw_output: dict, execution_time: float) -> ModuleResult:
        ...
```

Standard Module Output Contract:
```json
{
  "module_id": "CV-001",
  "module_name": "Handwritten Digit Recognition — CNN + MNIST",
  "category": "Computer Vision — CNN",
  "status": "completed",
  "confidence": 0.94,
  "result": {},
  "visualization": { "type": "bar", "title": "...", "data": [] },
  "explanation": "...",
  "execution_time": 0.024,
  "errors": []
}
```

---

## 3. CORE PROCESSING PIPELINE
Implement the 6-stage intelligent pipeline:
```text
Upload & Validation (MIME & Magic Bytes)
     ↓
Content Extraction & OCR Layout (pdfplumber, docx, pandas, PIL, OpenCV)
     ↓
Input Profiler (Document Type, Complexity, Word Count, Language)
     ↓
Dynamic Module Selection (Matching input profile against 450+ catalog)
     ↓
Parallel Module Execution (Fault-isolated scientific algorithms)
     ↓
AI Report Synthesizer (18 dynamic sections)
     ↓
Multi-Format Exporters (PDF, DOCX, HTML, JSON, CSV, TXT)
```

---

## 4. INTEGRATION API ENDPOINTS
Expose the following endpoints in the subproject:
- `POST /api/analyze`: Upload file and run full multi-module analysis.
- `GET /api/samples`: Return preset benchmark sample files.
- `POST /api/analyze/sample/{id}`: One-click run on preset benchmarks.
- `GET /api/modules`: Query and filter all 450+ modules by category, input type, and keywords.
- `GET /api/modules/{id}`: Get detailed specifications for any module.
- `POST /api/modules/{id}/execute`: Upload an input file and execute that single project module directly.
- `GET /api/exports/{filename}`: Stream exported PDF, DOCX, HTML, JSON, CSV, or TXT reports.
- `GET /api/history`: Retrieve past analysis telemetry runs.

---

## 5. DATABASE SCHEMA
Use SQLite with SQLAlchemy storing:
- `users`: ID, username, email, role.
- `documents`: Filename, file_path, size, mime_type.
- `input_profiles`: Profile JSON, document_type, language.
- `analyses`: Status, mode, applicable_count, completed_count, skipped_count, execution_time.
- `module_results`: Module ID, name, status, confidence, result JSON, visualization JSON.
- `reports`: Title, summary, full_report_json (18 sections).
- `processing_logs`: Timestamp, level, message.

---

## 6. INDIVIDUAL SUBPROJECT WORKBENCH (REQUIREMENT #37)
In every project detail view and module explorer card, provide an interactive upload zone where users can drop any file (e.g. photo, document, CSV) and click 'Execute Real Model Inference' to see live latency, confidence score, computed output metrics, and raw JSON.

---

## 7. OFFLINE / LOCAL AI PRINCIPLE
All 450 modules must run locally using scientific and deterministic Python libraries (OpenCV, NLTK, Scikit-learn, Pandas, Pillow, SciPy) without requiring external paid API keys.
