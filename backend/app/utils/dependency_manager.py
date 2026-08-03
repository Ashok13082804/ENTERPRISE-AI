"""
Automatic local AI dependency manager
Ensures necessary python modules are installed and ready to be used offline.
"""
import sys
import subprocess
import threading
from loguru import logger

# Mapping of python module name (used in import) to PyPI package name (used in pip install)
REQUIRED_PACKAGES = {
    "chromadb": "chromadb",
    "pptx": "python-pptx",
    "cv2": "opencv-python-headless==4.9.0.80",
    "pytesseract": "pytesseract",
    "easyocr": "easyocr",
    "rdkit": "rdkit",
    "sympy": "sympy",
    "sentence_transformers": "sentence-transformers",
    "faiss": "faiss-cpu",
    "vosk": "vosk",
    "whisper": "openai-whisper",
    "speech_recognition": "SpeechRecognition",
    "mediapipe": "mediapipe",
}

def is_installed(module_name: str) -> bool:
    try:
        __import__(module_name)
        return True
    except ImportError:
        return False

def install_package(package_name: str) -> bool:
    logger.info(f"Dynamically installing '{package_name}' package...")
    try:
        # Get path to current virtual env pip
        import os
        pip_path = os.path.join(os.path.dirname(sys.executable), "pip")
        if not os.path.exists(pip_path):
            pip_path = "pip"
        
        # Run pip install command
        cmd = [pip_path, "install", package_name, "--quiet"]
        subprocess.check_call(cmd)
        logger.info(f"Successfully installed '{package_name}'!")
        return True
    except Exception as e:
        logger.error(f"Failed to install '{package_name}': {e}")
        return False

def check_and_install_all():
    logger.info("Checking local AI dependencies...")
    missing = []
    for module, package in REQUIRED_PACKAGES.items():
        if not is_installed(module):
            logger.warning(f"Missing dependency: {module} (PyPI: {package})")
            missing.append(package)
        else:
            logger.info(f"Dependency available: {module}")
            
    if missing:
        logger.info(f"Installing {len(missing)} missing dependencies in background: {missing}")
        # Run in background thread to avoid blocking server startup
        def worker():
            for pkg in missing:
                install_package(pkg)
            logger.info("All missing dependencies processed!")
            
        thread = threading.Thread(target=worker, daemon=True)
        thread.start()
    else:
        logger.info("All local AI dependencies are already installed.")
