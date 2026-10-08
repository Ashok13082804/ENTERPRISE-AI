import os
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, List

def analyze_image_layout_and_text(image_path: str) -> Dict[str, Any]:
    """
    Analyzes visual layout, contours, detected text regions, bounding boxes,
    and heuristics for OCR / handwriting / forms.
    """
    try:
        img = cv2.imread(image_path)
        if img is None:
            # Try PIL fallback
            pil_img = Image.open(image_path).convert('RGB')
            img = np.array(pil_img)[:, :, ::-1]

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Blur score via Laplacian variance
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = laplacian_var < 100.0

        # Contrast and Brightness
        mean_val = float(np.mean(gray))
        std_val = float(np.std(gray))

        # Text region / contour detection using morphological gradient
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 3))
        grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, kernel)
        _, thresh = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)

        # Connect text regions horizontally
        connected_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 3))
        connected = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, connected_kernel)

        contours, _ = cv2.findContours(connected, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        text_regions: List[Dict[str, Any]] = []
        
        for cnt in contours:
            x, y, bw, bh = cv2.boundingRect(cnt)
            aspect_ratio = bw / float(bh) if bh > 0 else 0
            area = bw * bh
            if area > 100 and bw > 20 and bh > 8 and aspect_ratio > 0.8:
                text_regions.append({
                    "box": [int(x), int(y), int(bw), int(bh)],
                    "area": int(area),
                    "aspect_ratio": round(aspect_ratio, 2)
                })

        # Table grid detection (horizontal and vertical lines)
        horiz_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (int(w / 30), 1))
        vert_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, int(h / 30)))
        
        horiz_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, horiz_kernel)
        vert_lines = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, vert_kernel)
        table_grid = cv2.add(horiz_lines, vert_lines)
        grid_contours, _ = cv2.findContours(table_grid, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

        contains_tables = len(grid_contours) > 8
        contains_text = len(text_regions) > 2
        
        # Color distribution (dominant color channels)
        b, g, r = cv2.split(img)
        color_stats = {
            "mean_red": round(float(np.mean(r)), 1),
            "mean_green": round(float(np.mean(g)), 1),
            "mean_blue": round(float(np.mean(b)), 1),
            "is_grayscale": bool(np.max(np.abs(r.astype(int) - g.astype(int))) < 10 and np.max(np.abs(g.astype(int) - b.astype(int))) < 10)
        }

        # Check for handwriting characteristics (high stroke curvature variance)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.count_nonzero(edges)) / float(h * w)
        contains_handwriting = bool(edge_density > 0.15 and not contains_tables and len(text_regions) > 5)

        return {
            "image_width": int(w),
            "image_height": int(h),
            "laplacian_blur_score": round(laplacian_var, 2),
            "is_blurry": is_blurry,
            "brightness": round(mean_val, 1),
            "contrast": round(std_val, 1),
            "detected_text_regions": len(text_regions),
            "sample_boxes": text_regions[:10],
            "contains_text": contains_text,
            "contains_tables": contains_tables,
            "contains_handwriting": contains_handwriting,
            "edge_density": round(edge_density, 4),
            "color_stats": color_stats
        }
    except Exception as e:
        return {
            "error": str(e),
            "image_width": 0,
            "image_height": 0,
            "laplacian_blur_score": 0.0,
            "is_blurry": False,
            "brightness": 0.0,
            "contrast": 0.0,
            "detected_text_regions": 0,
            "sample_boxes": [],
            "contains_text": False,
            "contains_tables": False,
            "contains_handwriting": False,
            "edge_density": 0.0,
            "color_stats": {}
        }
