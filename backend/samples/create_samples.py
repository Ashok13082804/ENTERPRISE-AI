from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

SAMPLES_DIR = Path(__file__).resolve().parent

# 1. Sample Resume
resume_text = """Johnathan Doe
Senior Deep Learning & NLP Research Engineer
Email: johnathan.doe@neuroforge.ai | Phone: +1-555-019-2834 | GitHub: github.com/johndoe-ai

PROFESSIONAL SUMMARY
Innovative Deep Learning Specialist with 7+ years of expertise designing, training, and deploying large-scale neural architectures (PyTorch, Transformers, YOLO, BERT, CNN). Proven track record in automated document parsing, high-throughput inference optimization, and multimodal foundation models.

CORE TECHNICAL SKILLS
- Deep Learning & ML: PyTorch, TensorFlow, Scikit-learn, OpenCV, HuggingFace Transformers, Torchvision
- NLP & LLMs: BERT, GPT, T5, DeBERTa, Named Entity Recognition (NER), Sentiment Analysis, Semantic Embeddings, RAG
- Computer Vision: CNN, ResNet-50, YOLOv8, U-Net Segmentation, Image Classification, Facial Recognition
- Data & Backend: Python, SQL, Pandas, NumPy, FastAPI, Docker, Kubernetes, Linux, AWS, Git

WORK EXPERIENCE
Lead AI Engineer | NeuroForge Enterprises (2022 - Present)
- Architected production document intelligence platform processing 500,000+ complex technical documents with 98.4% extraction accuracy.
- Reduced model inference latency from 140ms to 18ms using TensorRT quantization and ONNX runtime integration.
- Led a team of 8 machine learning engineers developing computer vision and NLP pipelines.

Senior Machine Learning Engineer | DeepVision Labs (2019 - 2022)
- Implemented state-of-the-art vision transformer and ResNet-50 backbones for industrial defect classification.
- Authored custom loss functions improving F1-score across imbalanced classes from 82.1% to 94.6%.

EDUCATION & CERTIFICATIONS
- M.S. in Computer Science (Artificial Intelligence Specialization) - Stanford University
- B.S. in Electrical Engineering & Computer Science - UC Berkeley
- Certified Deep Learning Professional (NVIDIA Deep Learning Institute)
"""

with open(SAMPLES_DIR / "sample_resume.txt", "w", encoding="utf-8") as f:
    f.write(resume_text)

# 2. Sample Research Paper
paper_text = """Deep Residual Attention Networks for Document Layout Understanding
Authors: Ashok Kumar, Elena Rostova, David K. Vance
Affiliation: Institute for Advanced Neural Computing, NeuroForge AI Lab

ABSTRACT
Automated document analysis requires simultaneous parsing of textual hierarchy, tabular structures, and multimodal visual elements. In this paper, we propose ResAttn-Doc, a novel deep learning architecture integrating 50-layer convolutional feature pyramids with bidirectional multi-head self-attention. Evaluated on a diverse benchmark of 10,000 heterogeneous documents, our methodology achieves 96.8% accuracy on table extraction and 97.2% F1-score on token-level entity classification, outperforming existing CNN and transformer baselines by 4.3%.

1. INTRODUCTION & RESEARCH PROBLEM
Document image comprehension poses significant challenges due to typographical variability, multi-column layouts, and noise artifacts in scanned media [1]. Traditional rule-based heuristics fail to generalize across multilingual corpora. Recent breakthroughs in vision transformers have demonstrated the utility of joint text-visual representation learning [2].

2. METHODOLOGY & ARCHITECTURAL BACKBONE
Our model operates across three sequential stages:
a) Spatial feature extraction via ResNet-50 backbone with dilated convolutions.
b) Cross-attention projection mapping 2D bounding box spatial coordinates to word embeddings.
c) Multi-task classification head for semantic section segmentation and bounding box regression.

3. EXPERIMENTAL DATASET & RESULTS
We conducted experiments on the DocBank and RVL-CDIP datasets. Models were trained using AdamW optimizer with cosine learning rate scheduling (initial lr=3e-4, weight_decay=1e-2) on 8 NVIDIA A100 GPUs for 60 epochs.
- Table Understanding Accuracy: 96.8%
- Semantic Entity Classification F1: 97.2%
- Latency per page: 24.3 milliseconds

4. LIMITATIONS & FUTURE WORK
While highly effective on digital-native documents, extreme motion blur in degraded scanned documents presents failure modes. Future directions will explore self-supervised diffusion restoration.

5. REFERENCES
[1] Vaswani et al., 'Attention Is All You Need', NeurIPS 2017.
[2] He et al., 'Deep Residual Learning for Image Recognition', CVPR 2016.
[3] Devlin et al., 'BERT: Pre-training of Deep Bidirectional Transformers', NAACL 2019.
"""

with open(SAMPLES_DIR / "sample_research_paper.txt", "w", encoding="utf-8") as f:
    f.write(paper_text)

# 3. Sample Financial Tabular CSV
fin_csv = """date,ticker,open,high,low,close,volume,rsi_14,pe_ratio,market_cap_billions,return_pct
2026-01-05,NEURO,182.40,185.90,181.20,185.10,4820000,64.2,28.4,142.5,1.48
2026-01-06,NEURO,185.50,188.40,184.80,187.90,5120000,68.1,28.8,144.7,1.51
2026-01-07,NEURO,188.00,189.20,186.30,187.00,4310000,65.4,28.7,144.0,-0.48
2026-01-08,NEURO,187.20,192.50,186.90,191.80,6890000,74.2,29.4,147.7,2.57
2026-01-09,NEURO,192.00,194.80,191.10,194.20,5940000,78.5,29.8,149.5,1.25
2026-01-12,NEURO,194.50,196.20,193.00,195.40,4780000,80.1,30.0,150.4,0.62
2026-01-13,NEURO,195.00,195.80,191.40,192.10,5420000,67.8,29.5,147.9,-1.69
2026-01-14,NEURO,192.30,193.90,190.50,193.50,4210000,70.2,29.7,149.0,0.73
2026-01-15,NEURO,193.80,197.40,193.20,196.80,6120000,76.4,30.2,151.5,1.71
2026-01-16,NEURO,197.00,199.10,196.50,198.50,7230000,81.3,30.5,152.8,0.86
"""

with open(SAMPLES_DIR / "sample_financial_data.csv", "w", encoding="utf-8") as f:
    f.write(fin_csv)

# 4. Sample Invoice
invoice_text = """TAX INVOICE
NeuroForge Enterprise Solutions Inc.
100 Silicon Way, Tech District, CA 94025
GSTIN / VAT: US94025DL450
Invoice Number: INV-2026-0984
Invoice Date: 2026-09-15
Due Date: 2026-10-15

BILLED TO:
Apex Global Technologies Corp.
452 Innovation Blvd, Austin, TX 78701
Contact: accounts@apextech.com

ITEMIZED CHARGES:
Item # | Description | Qty | Unit Price | Total Amount
1 | Enterprise Deep Learning Platform Annual License | 1 | $18,500.00 | $18,500.00
2 | 450+ Model Acceleration Engine (GPU Cluster Nodes) | 4 | $2,250.00 | $9,000.00
3 | Automated Document Intelligence Pipeline Setup | 1 | $4,500.00 | $4,500.00
4 | SLA Dedicated Support & Model Retraining | 12 | $500.00 | $6,000.00

SUBTOTAL: $38,000.00
APPLICABLE TAX (8.25%): $3,135.00
TOTAL BALANCE DUE: $41,135.00

PAYMENT TERMS: Net 30 Days.
Bank Wire: Silicon Valley Reserve Bank | Routing: 121000358 | Account: 849204128
"""

with open(SAMPLES_DIR / "sample_invoice.txt", "w", encoding="utf-8") as f:
    f.write(invoice_text)

# 5. Generate a realistic Synthetic Chest X-Ray / Diagnostic Image
img_w, img_h = 512, 512
img = Image.new('L', (img_w, img_h), color=25)
draw = ImageDraw.Draw(img)

# Draw rib cage thoracic contour
draw.ellipse([60, 80, 452, 480], outline=110, width=8)
# Left lung field
draw.ellipse([100, 120, 230, 420], fill=65, outline=125, width=4)
# Right lung field
draw.ellipse([282, 120, 412, 420], fill=68, outline=125, width=4)
# Cardiac silhouette / Heart shadow
draw.ellipse([210, 260, 330, 440], fill=150, outline=180, width=3)
# Spine / vertebral column
draw.rectangle([248, 60, 264, 480], fill=165)
# Rib arches
for y in range(140, 420, 35):
    draw.arc([80, y, 240, y+50], start=180, end=360, fill=130, width=3)
    draw.arc([272, y, 432, y+50], start=180, end=360, fill=130, width=3)
# Minor opacity in right mid-zone
draw.ellipse([300, 220, 360, 280], fill=115)

img.save(SAMPLES_DIR / "sample_medical_xray.png")
print("Sample files created successfully!")
