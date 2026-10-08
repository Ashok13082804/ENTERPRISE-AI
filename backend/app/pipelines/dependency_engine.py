from typing import List
from app.modules.base import AnalysisModule

# Execution priority weights (lower runs earlier)
CATEGORY_PRIORITY = {
    "Document AI": 10,
    "Computer Vision — CNN": 20,
    "Object Detection — YOLO": 25,
    "U-Net / Segmentation": 30,
    "Medical Deep Learning": 35,
    "Agriculture + Deep Learning": 40,
    "NLP + LSTM/GRU": 50,
    "Transformers / BERT": 55,
    "Education + Deep Learning": 60,
    "Speech + Audio Deep Learning": 65,
    "Time-Series Deep Learning": 70,
    "Finance + Deep Learning": 75,
    "Cybersecurity + Deep Learning": 80,
    "Autoencoder Projects": 85,
    "GAN Projects": 90,
    "Robotics + Deep Learning": 92,
    "Multimodal Deep Learning": 95,
    "Video Deep Learning": 98
}

class DependencyEngine:
    @staticmethod
    def resolve_execution_order(modules: List[AnalysisModule]) -> List[AnalysisModule]:
        """
        Sorts modules topologically by domain dependency and processing stage:
        Document Parsing -> Vision/Extraction -> NLP/Sequence -> Higher-Order Modeling -> Multimodal
        """
        def get_sort_key(mod: AnalysisModule):
            priority = CATEGORY_PRIORITY.get(mod.category, 50)
            number = getattr(mod, 'number', 999)
            return (priority, number)

        return sorted(modules, key=get_sort_key)
