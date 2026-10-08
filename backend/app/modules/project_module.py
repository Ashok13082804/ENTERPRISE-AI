from typing import Dict, Any, List, Optional
from app.modules.base import AnalysisModule
from app.modules.domain_engines import (
    ComputerVisionEngine,
    NLPEngine,
    TabularDataEngine,
    MedicalDeepLearningEngine,
    SecurityEngine,
    TimeSeriesEngine
)

CATEGORY_PREFIX_MAP = {
    "Computer Vision — CNN": "CV",
    "Object Detection — YOLO": "OD",
    "Medical Deep Learning": "MED",
    "NLP + LSTM/GRU": "NLP",
    "Transformers / BERT": "TR",
    "Speech + Audio Deep Learning": "AUD",
    "Time-Series Deep Learning": "TS",
    "Cybersecurity + Deep Learning": "SEC",
    "Agriculture + Deep Learning": "AGR",
    "Education + Deep Learning": "EDU",
    "Finance + Deep Learning": "FIN",
    "GAN Projects": "GAN",
    "Autoencoder Projects": "AE",
    "U-Net / Segmentation": "SEG",
    "Robotics + Deep Learning": "ROB",
    "Multimodal Deep Learning": "MM",
    "Video Deep Learning": "VID",
}

class ProjectAnalysisModule(AnalysisModule):
    """
    Independent analysis module wrapping one of the 450 production-grade AI/ML/DL projects.
    """
    def __init__(self, project_data: Dict[str, Any]):
        self.project_data = project_data
        self.number = project_data.get("number", 1)
        self.project_id = project_data.get("id", self.number)
        prefix = CATEGORY_PREFIX_MAP.get(project_data.get("category", ""), "DL")
        self.module_id = f"{prefix}-{self.number:03d}"
        self.module_name = project_data.get("name", f"Project {self.number}")
        self.category = project_data.get("category", "Deep Learning")
        self.description = project_data.get("description", "")
        self.algorithms = project_data.get("algorithms", [])
        self.metrics = project_data.get("metrics", [])
        self.datasets = project_data.get("datasets", [])
        self.target_type = project_data.get("type", "Deep Learning")

        # Map supported inputs based on category
        cat_lower = self.category.lower()
        if any(k in cat_lower for k in ["vision", "detection", "segmentation", "gan", "robotics", "video", "agriculture"]):
            self.supported_inputs = ["image", "document", "multimodal"]
        elif any(k in cat_lower for k in ["medical"]):
            self.supported_inputs = ["image", "document", "text"]
        elif any(k in cat_lower for k in ["nlp", "transformer", "bert", "education", "lstm"]):
            self.supported_inputs = ["text", "document"]
        elif any(k in cat_lower for k in ["tabular", "finance", "time-series"]):
            self.supported_inputs = ["tabular", "document"]
        elif any(k in cat_lower for k in ["security", "cybersecurity"]):
            self.supported_inputs = ["text", "tabular", "document"]
        elif any(k in cat_lower for k in ["speech", "audio"]):
            self.supported_inputs = ["audio", "document"]
        else:
            self.supported_inputs = ["text", "image", "tabular", "document"]

    def is_applicable(self, input_profile: Dict[str, Any]) -> bool:
        file_cat = input_profile.get("file_category", "document")
        contains_text = input_profile.get("contains_text", False)
        contains_images = input_profile.get("contains_images", False)
        contains_tables = input_profile.get("contains_tables", False)
        doc_type = input_profile.get("document_type", "general_document")

        cat_lower = self.category.lower()

        # Medical specific check
        if "medical" in cat_lower:
            return doc_type in ["medical_image", "medical_report"] or contains_images or "medical" in str(input_profile.get("file_name", "")).lower()

        # Image-centric categories
        if any(k in cat_lower for k in ["vision", "detection", "segmentation", "gan", "robotics", "video"]):
            return file_cat == "image" or contains_images

        # Agriculture
        if "agriculture" in cat_lower:
            return (file_cat == "image" or contains_images) and doc_type != "source_code"

        # Tabular / Finance / Time-Series
        if any(k in cat_lower for k in ["finance", "time-series"]):
            return file_cat == "tabular" or contains_tables or doc_type in ["financial_dataset", "financial_document"]

        # NLP / Text
        if any(k in cat_lower for k in ["nlp", "transformer", "bert", "education", "lstm"]):
            return contains_text or file_cat in ["document", "text"]

        # Security
        if "security" in cat_lower:
            return contains_text or file_cat == "tabular"

        # Audio
        if "audio" in cat_lower or "speech" in cat_lower:
            return file_cat == "audio"

        # Fallback to general input matching
        return super().is_applicable(input_profile)

    def execute(self, data: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        cat_lower = self.category.lower()
        file_path = data.get("file_path", "")
        text = data.get("text", "")
        file_cat = data.get("file_category", "document")

        # Select execution engine
        if file_cat == "image" or (file_path and file_path.lower().endswith((".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff"))):
            if "medical" in cat_lower:
                base_res = MedicalDeepLearningEngine.analyze_medical(data, self.module_name)
            else:
                base_res = ComputerVisionEngine.analyze_image(file_path, self.module_name)
        elif file_cat == "tabular" or data.get("rows", 0) > 0:
            if "time-series" in cat_lower:
                base_res = TimeSeriesEngine.analyze_timeseries(data, self.module_name)
            else:
                base_res = TabularDataEngine.analyze_tabular(data, self.module_name)
        elif "security" in cat_lower:
            base_res = SecurityEngine.analyze_security(data, self.module_name)
        elif "medical" in cat_lower:
            base_res = MedicalDeepLearningEngine.analyze_medical(data, self.module_name)
        else:
            base_res = NLPEngine.analyze_text(text, self.module_name)

        # Enrich with project-specific algorithms and metrics
        res_dict = base_res.get("result", {})
        res_dict["module_id"] = self.module_id
        res_dict["category"] = self.category
        res_dict["deployed_algorithms"] = self.algorithms[:3]
        res_dict["target_metrics"] = self.metrics[:3]
        base_res["result"] = res_dict

        return base_res
