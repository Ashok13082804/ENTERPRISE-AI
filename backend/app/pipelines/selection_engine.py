from typing import Dict, Any, List, Tuple
from app.modules.base import AnalysisModule
from app.module_registry.registry import MODULE_REGISTRY

class ModuleSelectionEngine:
    @staticmethod
    def select_modules(
        input_profile: Dict[str, Any],
        manual_module_ids: List[str] = None
    ) -> Tuple[List[AnalysisModule], List[Dict[str, str]]]:
        """
        Dynamically analyzes the input profile and partitions the 450+ modules
        into:
          - applicable_modules: Modules selected for execution
          - skipped_modules: Modules omitted with clear explanation
        """
        all_modules = MODULE_REGISTRY.get_all()
        applicable_modules: List[AnalysisModule] = []
        skipped_modules: List[Dict[str, str]] = []

        # If user explicitly chose modules in manual mode
        if manual_module_ids:
            manual_set = set(manual_module_ids)
            for mod in all_modules:
                if mod.module_id in manual_set or str(getattr(mod, 'number', '')) in manual_set:
                    applicable_modules.append(mod)
                else:
                    skipped_modules.append({
                        "module_id": mod.module_id,
                        "module_name": mod.module_name,
                        "category": mod.category,
                        "reason": "Omitted by user in manual execution mode."
                    })
            return applicable_modules, skipped_modules

        # Automatic Intelligent Selection Mode
        file_cat = input_profile.get("file_category", "document")
        file_type = input_profile.get("file_type", "")
        doc_type = input_profile.get("document_type", "general_document")
        contains_text = input_profile.get("contains_text", False)
        contains_images = input_profile.get("contains_images", False)
        contains_tables = input_profile.get("contains_tables", False)

        for mod in all_modules:
            is_app = mod.is_applicable(input_profile)
            if is_app:
                applicable_modules.append(mod)
            else:
                reason = "Input does not match required modality or document type."
                cat_lower = mod.category.lower()
                if any(k in cat_lower for k in ["vision", "detection", "segmentation", "gan", "robotics", "video"]):
                    reason = f"Module requires visual/image media, but input '{input_profile.get('file_name', '')}' contains no images."
                elif any(k in cat_lower for k in ["tabular", "finance"]):
                    reason = "Module requires structured tabular or financial matrices, but input is unstructured text/media."
                elif "audio" in cat_lower or "speech" in cat_lower:
                    reason = "Module requires acoustic/speech waveforms, but input is not an audio file."
                elif "medical" in cat_lower:
                    reason = "Module requires clinical/diagnostic scan data, but input document is non-medical."

                skipped_modules.append({
                    "module_id": mod.module_id,
                    "module_name": mod.module_name,
                    "category": mod.category,
                    "reason": reason
                })

        return applicable_modules, skipped_modules
