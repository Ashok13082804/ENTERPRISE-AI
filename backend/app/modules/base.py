import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class ModuleResult(BaseModel):
    module_id: str
    module_name: str
    category: str
    status: str = "completed"  # completed, skipped, failed
    confidence: float = 0.90
    result: Dict[str, Any] = Field(default_factory=dict)
    visualization: Optional[Dict[str, Any]] = None
    explanation: str = ""
    execution_time: float = 0.0
    errors: List[str] = Field(default_factory=list)

class AnalysisModule:
    """
    Base class for all 450+ independent AI/ML/DL/NLP/CV analysis modules.
    """
    module_id: str = "BASE-000"
    module_name: str = "Base Module"
    category: str = "General"
    description: str = "Base Analysis Module"
    supported_inputs: List[str] = ["text", "document"]  # text, image, tabular, audio, video, multimodal
    model_name: str = "Rule-Based Scientific Heuristic"
    parameters: Dict[str, Any] = {}

    def is_applicable(self, input_profile: Dict[str, Any]) -> bool:
        """
        Determines dynamically whether this module should run on the given input profile.
        """
        input_cat = input_profile.get("file_category", "document")
        contains_text = input_profile.get("contains_text", False)
        contains_images = input_profile.get("contains_images", False)
        contains_tables = input_profile.get("contains_tables", False)

        if "all" in self.supported_inputs:
            return True
        if "text" in self.supported_inputs or "document" in self.supported_inputs:
            if contains_text:
                return True
        if "image" in self.supported_inputs:
            if contains_images or input_cat == "image":
                return True
        if "tabular" in self.supported_inputs:
            if contains_tables or input_cat == "tabular":
                return True
        if "audio" in self.supported_inputs and input_cat == "audio":
            return True
        if "video" in self.supported_inputs and input_cat == "video":
            return True
        return False

    def execute(self, data: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes the module's core algorithm on the input data.
        Must be overridden by subclasses.
        """
        raise NotImplementedError("Subclasses must implement execute()")

    def format_result(self, raw_output: Dict[str, Any], execution_time: float) -> ModuleResult:
        confidence = raw_output.get("confidence", 0.90)
        explanation = raw_output.get("explanation", f"Analysis completed by {self.module_name}.")
        visualization = raw_output.get("visualization", None)
        errors = raw_output.get("errors", [])
        status = "failed" if errors else "completed"

        return ModuleResult(
            module_id=self.module_id,
            module_name=self.module_name,
            category=self.category,
            status=status,
            confidence=round(confidence, 3),
            result=raw_output.get("result", raw_output),
            visualization=visualization,
            explanation=explanation,
            execution_time=round(execution_time, 4),
            errors=errors
        )

    def run(self, data: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> ModuleResult:
        start_time = time.time()
        try:
            raw_output = self.execute(data, context)
            elapsed = time.time() - start_time
            return self.format_result(raw_output, elapsed)
        except Exception as e:
            elapsed = time.time() - start_time
            return ModuleResult(
                module_id=self.module_id,
                module_name=self.module_name,
                category=self.category,
                status="failed",
                confidence=0.0,
                result={},
                visualization=None,
                explanation=f"Execution failed: {str(e)}",
                execution_time=round(elapsed, 4),
                errors=[str(e)]
            )
