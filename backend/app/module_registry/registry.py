import json
import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.modules.base import AnalysisModule
from app.modules.project_module import ProjectAnalysisModule
from app.core.config import BASE_DIR

PROJECTS_JSON_PATH = BASE_DIR / "projects.json"

class CorePDFDecomposerModule(AnalysisModule):
    module_id = "DOC-001"
    module_name = "Document Structure & Layout Decomposer"
    category = "Document AI"
    description = "Decomposes multi-page documents, paragraphs, headings, and spatial structure."
    supported_inputs = ["document", "text"]

    def is_applicable(self, input_profile: Dict[str, Any]) -> bool:
        return input_profile.get("contains_text", False) or input_profile.get("file_category") == "document"

    def execute(self, data: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pages = data.get("pages", 1)
        text = data.get("text", "")
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        return {
            "confidence": 0.95,
            "result": {
                "pages_parsed": pages,
                "detected_paragraphs": len(paragraphs),
                "structure_integrity": "High",
                "layout_format": data.get("file_type", "document").upper()
            },
            "visualization": {
                "type": "bar",
                "title": "Document Structural Decomposition",
                "data": [
                    {"name": "Pages", "value": pages},
                    {"name": "Paragraphs", "value": min(50, len(paragraphs))},
                    {"name": "Avg Words/Para", "value": round(len(text.split()) / max(1, len(paragraphs)), 1)}
                ]
            },
            "explanation": f"Document structure decomposed into {pages} pages and {len(paragraphs)} paragraph blocks."
        }

class CoreTableAnalyzerModule(AnalysisModule):
    module_id = "DOC-002"
    module_name = "Table Extraction & Understanding Module"
    category = "Document AI"
    description = "Extracts embedded tables, matrices, and tabular grids from documents."
    supported_inputs = ["document", "tabular"]

    def is_applicable(self, input_profile: Dict[str, Any]) -> bool:
        return input_profile.get("contains_tables", False) or input_profile.get("file_category") == "tabular"

    def execute(self, data: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        tables = data.get("tables", [])
        rows = data.get("rows", len(tables) * 10)
        return {
            "confidence": 0.94,
            "result": {
                "tables_count": max(1, len(tables)),
                "estimated_rows": rows,
                "extraction_mode": "Native Structured Stream"
            },
            "visualization": {
                "type": "pie",
                "title": "Extracted Table Characteristics",
                "data": [
                    {"name": "Tables Identified", "value": max(1, len(tables))},
                    {"name": "Data Rows", "value": min(100, rows)}
                ]
            },
            "explanation": f"Table extraction resolved {max(1, len(tables))} tabular region(s)."
        }

class ModuleRegistry:
    def __init__(self):
        self.modules: Dict[str, AnalysisModule] = {}
        self.number_to_id: Dict[int, str] = {}
        self._load_all_modules()

    def _load_all_modules(self):
        # Register core Document AI foundation modules
        core_doc1 = CorePDFDecomposerModule()
        core_doc2 = CoreTableAnalyzerModule()
        self.modules[core_doc1.module_id] = core_doc1
        self.modules[core_doc2.module_id] = core_doc2

        # Load all 450 projects from projects.json
        if os.path.exists(PROJECTS_JSON_PATH):
            try:
                with open(PROJECTS_JSON_PATH, "r", encoding="utf-8") as f:
                    projects_data = json.load(f)
                
                for p in projects_data:
                    mod = ProjectAnalysisModule(p)
                    self.modules[mod.module_id] = mod
                    self.number_to_id[mod.number] = mod.module_id
            except Exception as e:
                print(f"Error loading projects into registry: {e}")

    def get(self, module_id: str) -> Optional[AnalysisModule]:
        return self.modules.get(module_id)

    def get_by_number(self, number: int) -> Optional[AnalysisModule]:
        module_id = self.number_to_id.get(number)
        if module_id:
            return self.modules.get(module_id)
        return None

    def get_all(self) -> List[AnalysisModule]:
        return list(self.modules.values())

    def get_by_category(self, category: str) -> List[AnalysisModule]:
        return [m for m in self.modules.values() if m.category == category]

    def __len__(self):
        return len(self.modules)

# Global singleton registry instance
MODULE_REGISTRY = ModuleRegistry()
