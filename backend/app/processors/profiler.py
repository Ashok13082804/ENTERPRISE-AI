import re
from typing import Dict, Any, List

def detect_document_type(text: str, file_category: str, extracted_data: Dict[str, Any]) -> str:
    text_lower = text.lower() if text else ""

    if file_category == "image":
        # Check if medical image / scan
        layout = extracted_data.get("layout", {})
        color_stats = layout.get("color_stats", {})
        if color_stats.get("is_grayscale", False) and layout.get("edge_density", 0) > 0.08:
            return "medical_image"
        if extracted_data.get("contains_text", False):
            if any(k in text_lower for k in ["invoice", "tax", "total", "subtotal", "bill"]):
                return "invoice"
            if any(k in text_lower for k in ["receipt", "cashier", "amount due"]):
                return "receipt"
            return "scanned_document"
        return "natural_image"

    if file_category == "tabular":
        # Check if financial or general tabular
        cols = [str(c).lower() for c in extracted_data.get("column_names", [])]
        if any(k in " ".join(cols) for k in ["price", "close", "open", "volume", "return", "profit", "loss", "credit", "amount"]):
            return "financial_dataset"
        return "tabular_dataset"

    # For text / document formats
    # Resume markers
    resume_score = sum(1 for w in ["education", "experience", "skills", "certifications", "curriculum vitae", "resume", "work experience", "achievements"] if w in text_lower)
    if resume_score >= 3:
        return "resume"

    # Research paper markers
    paper_score = sum(1 for w in ["abstract", "methodology", "references", "conclusion", "dataset", "experiments", "arxiv", "ieee", "doi", "et al."] if w in text_lower)
    if paper_score >= 3:
        return "research_paper"

    # Invoice / Receipt markers
    if any(k in text_lower for k in ["invoice number", "tax invoice", "bill to", "due date", "balance due", "gstin", "vat"]):
        return "invoice"
    if any(k in text_lower for k in ["sales receipt", "terminal #", "cash tender", "subtotal"]):
        return "receipt"

    # Legal contract markers
    contract_score = sum(1 for w in ["hereby", "whereas", "parties agree", "terms and conditions", "confidentiality", "indemnification", "jurisdiction"] if w in text_lower)
    if contract_score >= 3:
        return "legal_contract"

    # Financial document markers
    financial_score = sum(1 for w in ["balance sheet", "income statement", "ebitda", "fiscal year", "cash flows", "net profit", "quarter ended"] if w in text_lower)
    if financial_score >= 3:
        return "financial_document"

    # Medical report markers
    medical_score = sum(1 for w in ["patient", "diagnosis", "clinical", "pathology", "symptoms", "prescription", "radiology", "dosage"] if w in text_lower)
    if medical_score >= 3:
        return "medical_report"

    # Code markers
    if any(k in text_lower for k in ["import ", "function ", "class ", "def ", "return ", "public static", "const "]):
        return "source_code"

    return "general_document"

def detect_language(text: str) -> str:
    if not text or len(text.strip()) < 10:
        return "Undetermined"
    
    sample = text[:1000].lower()
    # Simple common stopword heuristic
    en_words = {"the", "and", "is", "in", "to", "of", "that", "it", "with", "as", "for", "on"}
    es_words = {"el", "la", "de", "que", "y", "en", "un", "por", "con", "no", "una", "su"}
    fr_words = {"le", "la", "de", "et", "en", "un", "du", "pour", "dans", "qui", "les", "des"}
    de_words = {"der", "die", "das", "und", "in", "zu", "den", "mit", "von", "ein", "eine", "ist"}

    words = set(re.findall(r"\b[a-z]{2,}\b", sample))
    scores = {
        "English": len(words & en_words),
        "Spanish": len(words & es_words),
        "French": len(words & fr_words),
        "German": len(words & de_words)
    }
    top_lang = max(scores, key=scores.get)
    if scores[top_lang] > 0:
        return top_lang
    return "English"

def estimate_complexity(extracted_data: Dict[str, Any], doc_type: str) -> str:
    word_count = extracted_data.get("word_count", 0)
    pages = extracted_data.get("pages", 1)
    has_tables = extracted_data.get("contains_tables", False)
    rows = extracted_data.get("rows", 0)

    if pages > 10 or word_count > 5000 or rows > 500 or doc_type in ["research_paper", "legal_contract"]:
        return "high"
    elif pages > 3 or word_count > 1000 or rows > 50 or has_tables:
        return "medium"
    return "low"

def build_input_profile(file_info: Dict[str, Any], extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    file_type = file_info.get("file_type", "unknown")
    file_category = file_info.get("file_category", "document")
    text = extracted_data.get("text", "")
    pages = extracted_data.get("pages", 1)
    
    doc_type = detect_document_type(text, file_category, extracted_data)
    lang = detect_language(text)
    complexity = estimate_complexity(extracted_data, doc_type)

    contains_text = bool(text and len(text.strip()) > 10) or extracted_data.get("contains_text", False)
    contains_tables = extracted_data.get("contains_tables", False)
    contains_images = file_category == "image" or extracted_data.get("contains_images", False)
    contains_handwriting = extracted_data.get("contains_handwriting", False)
    contains_forms = doc_type in ["invoice", "receipt", "contract", "resume"]

    words = text.split() if text else []
    unique_words = set(w.lower() for w in words)
    vocab_richness = round(len(unique_words) / len(words), 3) if len(words) > 0 else 0.0

    return {
        "file_name": file_info.get("filename", ""),
        "file_size": file_info.get("file_size", 0),
        "file_type": file_type,
        "file_category": file_category,
        "mime_type": file_info.get("mime_type", ""),
        "pages": pages,
        "language": lang,
        "document_type": doc_type,
        "estimated_complexity": complexity,
        "contains_text": contains_text,
        "contains_images": contains_images,
        "contains_tables": contains_tables,
        "contains_handwriting": contains_handwriting,
        "contains_forms": contains_forms,
        "contains_code": doc_type == "source_code",
        "word_count": len(words),
        "char_count": len(text),
        "vocabulary_richness": vocab_richness,
        "tabular_meta": {
            "rows": extracted_data.get("rows", 0),
            "columns": extracted_data.get("columns", 0),
            "numeric_columns": extracted_data.get("numeric_columns", []),
            "categorical_columns": extracted_data.get("categorical_columns", []),
            "missing_values_count": extracted_data.get("missing_values_count", 0)
        } if file_category == "tabular" else None,
        "image_meta": {
            "width": extracted_data.get("width", 0),
            "height": extracted_data.get("height", 0),
            "color_mode": extracted_data.get("color_mode", ""),
            "channels": extracted_data.get("channels", 3),
            "is_blurry": extracted_data.get("layout", {}).get("is_blurry", False),
            "blur_score": extracted_data.get("layout", {}).get("laplacian_blur_score", 0.0),
            "brightness": extracted_data.get("layout", {}).get("brightness", 0.0),
            "contrast": extracted_data.get("layout", {}).get("contrast", 0.0)
        } if file_category == "image" else None
    }
