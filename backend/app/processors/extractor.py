import os
import json
import zipfile
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
from PIL import Image

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import docx
except ImportError:
    docx = None

from app.processors.ocr_engine import analyze_image_layout_and_text

def extract_pdf_content(file_path: str) -> Dict[str, Any]:
    text_content = []
    tables_found = []
    num_pages = 0
    has_images = False

    if pdfplumber is not None:
        try:
            with pdfplumber.open(file_path) as pdf:
                num_pages = len(pdf.pages)
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_content.append(page_text)
                    page_tables = page.extract_tables()
                    if page_tables:
                        for tbl in page_tables:
                            if len(tbl) > 1:
                                tables_found.append({
                                    "page": i + 1,
                                    "rows": len(tbl),
                                    "cols": len(tbl[0]) if tbl else 0,
                                    "sample": tbl[:3]
                                })
                    if len(page.images) > 0:
                        has_images = True
        except Exception:
            pass

    if not text_content and PyPDF2 is not None:
        try:
            with open(file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                num_pages = len(reader.pages)
                for page in reader.pages:
                    txt = page.extract_text()
                    if txt:
                        text_content.append(txt)
        except Exception:
            pass

    full_text = "\n\n".join(text_content).strip()
    return {
        "text": full_text,
        "pages": num_pages,
        "tables": tables_found,
        "contains_tables": len(tables_found) > 0,
        "contains_images": has_images,
        "char_count": len(full_text),
        "word_count": len(full_text.split()) if full_text else 0
    }

def extract_docx_content(file_path: str) -> Dict[str, Any]:
    full_text = []
    tables_data = []

    if docx is not None:
        try:
            doc = docx.Document(file_path)
            for p in doc.paragraphs:
                if p.text.strip():
                    full_text.append(p.text.strip())
            for i, tbl in enumerate(doc.tables):
                tbl_rows = []
                for row in tbl.rows:
                    row_data = [c.text.strip() for c in row.cells]
                    tbl_rows.append(row_data)
                if tbl_rows:
                    tables_data.append({
                        "table_index": i + 1,
                        "rows": len(tbl_rows),
                        "cols": len(tbl_rows[0]) if tbl_rows else 0,
                        "sample": tbl_rows[:3]
                    })
        except Exception:
            pass

    combined_text = "\n\n".join(full_text)
    return {
        "text": combined_text,
        "pages": max(1, len(combined_text) // 2500),
        "tables": tables_data,
        "contains_tables": len(tables_data) > 0,
        "contains_images": False,
        "char_count": len(combined_text),
        "word_count": len(combined_text.split()) if combined_text else 0
    }

def extract_tabular_content(file_path: str, file_type: str) -> Dict[str, Any]:
    try:
        if file_type in ["csv", "tsv"]:
            sep = "\t" if file_type == "tsv" else ","
            df = pd.read_csv(file_path, sep=sep, nrows=1000)
        elif file_type == "xlsx":
            df = pd.read_excel(file_path, nrows=1000)
        elif file_type == "json":
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            if isinstance(data, list):
                df = pd.json_normalize(data[:1000])
            elif isinstance(data, dict):
                df = pd.DataFrame([data])
            else:
                df = pd.DataFrame({"raw_value": [str(data)]})
        else:
            return {"error": "Unsupported tabular format"}

        # Extract profiling summary
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
        categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
        missing_count = int(df.isnull().sum().sum())

        return {
            "rows": int(len(df)),
            "columns": int(len(df.columns)),
            "column_names": df.columns.tolist()[:30],
            "numeric_columns": numeric_cols[:20],
            "categorical_columns": categorical_cols[:20],
            "missing_values_count": missing_count,
            "has_missing_values": missing_count > 0,
            "sample_data": df.head(5).to_dict(orient="records"),
            "describe": df.describe().to_dict() if len(numeric_cols) > 0 else {},
            "contains_tables": True,
            "text": f"Tabular dataset with {len(df)} rows and columns: {', '.join(df.columns.astype(str)[:20])}"
        }
    except Exception as e:
        return {
            "error": str(e),
            "rows": 0,
            "columns": 0,
            "column_names": [],
            "numeric_columns": [],
            "categorical_columns": [],
            "missing_values_count": 0,
            "has_missing_values": False,
            "sample_data": [],
            "contains_tables": False,
            "text": ""
        }

def extract_image_content(file_path: str) -> Dict[str, Any]:
    try:
        pil_img = Image.open(file_path)
        w, h = pil_img.size
        mode = pil_img.mode
        format_name = pil_img.format or "IMAGE"

        # Detailed visual layout & text region analysis
        layout_info = analyze_image_layout_and_text(file_path)

        return {
            "width": w,
            "height": h,
            "color_mode": mode,
            "channels": len(mode),
            "format": format_name,
            "layout": layout_info,
            "contains_text": layout_info.get("contains_text", False),
            "contains_tables": layout_info.get("contains_tables", False),
            "contains_handwriting": layout_info.get("contains_handwriting", False),
            "text": f"Image with dimensions {w}x{h}, mode {mode}. Visual layout detected {layout_info.get('detected_text_regions', 0)} text/feature regions."
        }
    except Exception as e:
        return {
            "error": str(e),
            "width": 0,
            "height": 0,
            "color_mode": "RGB",
            "channels": 3,
            "format": "UNKNOWN",
            "layout": {},
            "contains_text": False,
            "contains_tables": False,
            "contains_handwriting": False,
            "text": ""
        }

def extract_plain_text(file_path: str) -> Dict[str, Any]:
    try:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read(500000)  # read up to 500k chars
        words = text.split()
        return {
            "text": text,
            "pages": max(1, len(text) // 2500),
            "char_count": len(text),
            "word_count": len(words),
            "contains_tables": bool("---" in text and "|" in text),
            "contains_images": False
        }
    except Exception as e:
        return {"text": "", "pages": 1, "char_count": 0, "word_count": 0, "error": str(e)}

def extract_archive_content(file_path: str) -> Dict[str, Any]:
    try:
        with zipfile.ZipFile(file_path, "r") as z:
            file_list = z.namelist()
        text = f"Archive contains {len(file_list)} files: {', '.join(file_list[:25])}"
        return {
            "text": text,
            "file_count": len(file_list),
            "files": file_list[:50],
            "pages": 1,
            "word_count": len(text.split()),
            "contains_tables": any(f.endswith((".csv", ".xlsx")) for f in file_list),
            "contains_images": any(f.endswith((".jpg", ".png", ".jpeg")) for f in file_list)
        }
    except Exception as e:
        return {"text": "", "file_count": 0, "files": [], "error": str(e)}

def extract_content(file_path: str, file_type: str, file_category: str) -> Dict[str, Any]:
    """
    Unified extractor returning text, structure, tables, and image/audio metadata.
    """
    if file_type == "pdf":
        return extract_pdf_content(file_path)
    elif file_type == "docx":
        return extract_docx_content(file_path)
    elif file_category == "tabular":
        return extract_tabular_content(file_path, file_type)
    elif file_category == "image":
        return extract_image_content(file_path)
    elif file_type == "zip":
        return extract_archive_content(file_path)
    else:
        return extract_plain_text(file_path)
