# Project #2: Fashion Image Classification — CNN + Fashion-MNIST

> **Category**: Computer Vision — CNN  
> **Difficulty**: Intermediate  
> **Technologies**: PyTorch, OpenCV, Torchvision, Scikit-learn

---

## 🎯 Problem Statement
Build an automated deep learning decision and inference system for 'Fashion Image Classification — CNN + Fashion-MNIST'. The objective is to design, train, evaluate, and deploy a robust neural model that delivers high accuracy and low latency.

## 🚀 Learning & Engineering Objective
Master end-to-end implementation of Fashion Image Classification — CNN + Fashion-MNIST using PyTorch and modern deep learning methodologies.

---

## 🧠 Neural Architecture & Algorithms
- **Primary Backbone**: `ResNet-50`
- **Active Algorithms**: ResNet-50, MobileNetV3, EfficientNet, VGG-16
- **Recommended Datasets**: CIFAR-100, ImageNet Subset, MNIST / Fashion-MNIST, Custom Curated Dataset
- **Target Metrics**: Accuracy, Precision, Recall, F1-Score, Top-5 Accuracy

---

## 🛠️ Quick Start

```bash
# 1. Setup environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Train model
python src/train.py

# 3. Start API microservice
python app.py
```

## 🐳 Docker Deployment

```bash
docker build -t neuroforge-project-2 .
docker run -p 8000:8000 neuroforge-project-2
```
