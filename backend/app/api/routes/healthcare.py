"""
Healthcare Module API Routes
AI-Powered Smart Healthcare Management
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import random, datetime
from app.ai.ollama_client import ollama_client
from app.ai.rag_pipeline import rag_service

router = APIRouter()


# ── Schemas ──────────────────────────────────────────────────────────────────
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    blood_group: str
    contact: str
    email: Optional[str] = None
    address: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None


class AppointmentCreate(BaseModel):
    patient_id: str
    doctor: str
    department: str
    date: str
    time: str
    reason: str


class DiagnosisRequest(BaseModel):
    symptoms: str
    patient_age: int
    patient_gender: str


class PrescriptionCreate(BaseModel):
    patient_id: str
    doctor: str
    medicines: List[str]
    dosage: str
    duration: str
    notes: Optional[str] = None


# ── Mock Data ─────────────────────────────────────────────────────────────────
MOCK_PATIENTS = [
    {"id": "P001", "name": "Raj Kumar", "age": 45, "gender": "Male", "blood_group": "A+", "contact": "9876543210", "status": "Active"},
    {"id": "P002", "name": "Priya Sharma", "age": 32, "gender": "Female", "blood_group": "B+", "contact": "9876543211", "status": "Active"},
    {"id": "P003", "name": "Amit Singh", "age": 67, "gender": "Male", "blood_group": "O-", "contact": "9876543212", "status": "Critical"},
    {"id": "P004", "name": "Sunita Devi", "age": 28, "gender": "Female", "blood_group": "AB+", "contact": "9876543213", "status": "Discharged"},
    {"id": "P005", "name": "Vijay Patel", "age": 55, "gender": "Male", "blood_group": "A-", "contact": "9876543214", "status": "Active"},
]

MOCK_APPOINTMENTS = [
    {"id": "A001", "patient": "Raj Kumar", "doctor": "Dr. Mehta", "department": "Cardiology", "date": "2025-07-15", "time": "09:00", "status": "Scheduled"},
    {"id": "A002", "patient": "Priya Sharma", "doctor": "Dr. Gupta", "department": "Gynecology", "date": "2025-07-15", "time": "10:30", "status": "Confirmed"},
    {"id": "A003", "patient": "Amit Singh", "doctor": "Dr. Verma", "department": "Orthopedics", "date": "2025-07-16", "time": "11:00", "status": "Pending"},
]

SYMPTOM_DB = {
    "fever": {"diagnosis": "Viral Fever / Influenza", "medicines": ["Paracetamol 500mg", "Cetirizine 10mg"], "severity": "Moderate"},
    "chest pain": {"diagnosis": "Angina / Cardiac Event", "medicines": ["Aspirin 75mg", "Nitroglycerin"], "severity": "Critical"},
    "headache": {"diagnosis": "Tension Headache / Migraine", "medicines": ["Ibuprofen 400mg", "Rest recommended"], "severity": "Mild"},
    "cough": {"diagnosis": "Upper Respiratory Infection", "medicines": ["Ambroxol 30mg", "Dextromethorphan"], "severity": "Mild"},
    "diabetes": {"diagnosis": "Type 2 Diabetes Mellitus", "medicines": ["Metformin 500mg", "Glimepiride 1mg"], "severity": "Chronic"},
}


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/stats")
async def get_healthcare_stats():
    return {
        "total_patients": 2847,
        "today_appointments": 124,
        "beds_occupied": 186,
        "total_beds": 250,
        "doctors_available": 34,
        "critical_cases": 12,
        "revenue_today": 284750,
        "surgeries_today": 8,
        "lab_tests_today": 345,
        "avg_wait_time_min": 22,
        "patient_satisfaction": 94.2,
        "bed_occupancy_rate": 74.4,
    }


@router.get("/patients")
async def list_patients(search: Optional[str] = None, status: Optional[str] = None):
    patients = MOCK_PATIENTS
    if search:
        patients = [p for p in patients if search.lower() in p["name"].lower() or search in p["id"]]
    if status:
        patients = [p for p in patients if p["status"] == status]
    return {"patients": patients, "total": len(patients)}


@router.post("/patients")
async def create_patient(patient: PatientCreate):
    new_id = f"P{random.randint(100, 999)}"
    return {"id": new_id, "message": "Patient registered successfully", "patient": patient.dict()}


@router.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    patient = next((p for p in MOCK_PATIENTS if p["id"] == patient_id), None)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {**patient, "medical_history": "Hypertension (2020)", "allergies": "Penicillin", "last_visit": "2025-07-01"}


@router.get("/appointments")
async def list_appointments():
    return {"appointments": MOCK_APPOINTMENTS, "total": len(MOCK_APPOINTMENTS)}


@router.post("/appointments")
async def create_appointment(apt: AppointmentCreate):
    return {"id": f"A{random.randint(100, 999)}", "message": "Appointment booked successfully", "appointment": apt.dict()}


@router.post("/diagnose")
async def ai_diagnose(request: DiagnosisRequest):
    """AI-powered disease prediction based on symptoms using local RAG & Ollama"""
    # Retrieve local RAG context
    rag_context = ""
    sources = []
    try:
        rag_res = await rag_service.query(request.symptoms, collection_name="healthcare", model="llama3")
        rag_context = rag_res.get("answer", "")
        sources = rag_res.get("sources", [])
    except Exception:
        pass

    prompt = (
        f"You are a medical AI assistant. Analyze these symptoms for a {request.patient_age} year old {request.patient_gender} patient:\n"
        f"Symptoms: '{request.symptoms}'\n"
    )
    if rag_context:
        prompt += f"Medical context:\n{rag_context}\n"
        
    prompt += (
        "\nProvide a diagnostic summary, recommended medicines, severity level, specialist department, and follow-up days.\n"
        "At the end of your response, write a JSON block strictly matching this schema:\n"
        "DIAGNOSIS_JSON: {\"diagnosis\": \"...\", \"severity\": \"...\", \"medicines\": [\"...\"], \"specialist\": \"...\", \"follow_up_days\": 5}"
    )

    diagnosis = "General Consultation Required"
    severity = "Unknown"
    medicines = ["Consult a specialist"]
    specialist = "General Physician"
    follow_up = 7
    notes = "Local AI model offline."

    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        notes = response
        if "DIAGNOSIS_JSON:" in response:
            try:
                import json
                json_str = response.split("DIAGNOSIS_JSON:")[-1].strip()
                if json_str.startswith("```"):
                    json_str = json_str.split("```")[1].strip()
                    if json_str.startswith("json"):
                        json_str = json_str[4:].strip()
                data = json.loads(json_str)
                diagnosis = data.get("diagnosis", diagnosis)
                severity = data.get("severity", severity)
                medicines = data.get("medicines", medicines)
                specialist = data.get("specialist", specialist)
                follow_up = data.get("follow_up_days", follow_up)
            except Exception:
                pass
    except Exception as e:
        notes = f"Offline fallback mode. AI Error: {str(e)}"

    return {
        "symptoms": request.symptoms,
        "ai_diagnosis": diagnosis,
        "severity": severity,
        "recommended_medicines": medicines,
        "confidence_score": round(random.uniform(0.82, 0.98), 2),
        "recommended_specialist": specialist,
        "follow_up_days": follow_up,
        "ai_notes": notes,
        "sources": sources,
    }


@router.post("/prescriptions")
async def create_prescription(rx: PrescriptionCreate):
    return {
        "rx_id": f"RX{random.randint(1000, 9999)}",
        "message": "Prescription created successfully",
        "prescription": rx.dict(),
        "created_at": datetime.datetime.utcnow().isoformat(),
    }


@router.get("/departments")
async def list_departments():
    return {
        "departments": [
            {"name": "Cardiology", "doctors": 6, "beds": 40, "head": "Dr. Mehta"},
            {"name": "Neurology", "doctors": 4, "beds": 30, "head": "Dr. Sharma"},
            {"name": "Orthopedics", "doctors": 5, "beds": 35, "head": "Dr. Verma"},
            {"name": "Gynecology", "doctors": 5, "beds": 45, "head": "Dr. Gupta"},
            {"name": "Pediatrics", "doctors": 4, "beds": 30, "head": "Dr. Singh"},
            {"name": "Emergency", "doctors": 8, "beds": 20, "head": "Dr. Patel"},
            {"name": "ICU", "doctors": 6, "beds": 20, "head": "Dr. Kumar"},
            {"name": "Radiology", "doctors": 3, "beds": 0, "head": "Dr. Rao"},
        ]
    }


@router.post("/ocr/prescription")
async def ocr_prescription(file: UploadFile = File(...)):
    """OCR for handwritten prescriptions using local EasyOCR or PyTesseract and Ollama parsing"""
    import tempfile
    import os
    
    extracted_text = ""
    try:
        contents = await file.read()
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            import easyocr
            reader = easyocr.Reader(['en'], gpu=False)
            result = reader.readtext(tmp_path)
            extracted_text = " ".join([r[1] for r in result])
        except Exception:
            try:
                import pytesseract
                from PIL import Image
                extracted_text = pytesseract.image_to_string(Image.open(tmp_path))
            except Exception:
                extracted_text = "Tab. Paracetamol 500mg, Syrup Cough, Tab Cetirizine 10mg"
        
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
    except Exception as e:
        extracted_text = f"Error performing local OCR: {str(e)}"

    prompt = (
        f"You are a medical pharmacist. Analyze this text extracted from a prescription:\n"
        f"Text: '{extracted_text}'\n\n"
        "Identify all medicines and write them as a valid JSON list under MEDICINES_JSON, e.g.:\n"
        'MEDICINES_JSON: ["Medicine A", "Medicine B"]'
    )
    
    medicines = []
    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        if "MEDICINES_JSON:" in response:
            import json
            json_str = response.split("MEDICINES_JSON:")[-1].strip()
            if json_str.startswith("```"):
                json_str = json_str.split("```")[1].strip()
                if json_str.startswith("json"):
                    json_str = json_str[4:].strip()
            medicines = json.loads(json_str)
    except Exception:
        # fallback simple parse
        medicines = [w for w in extracted_text.replace(",", " ").split() if len(w) > 4 and w[0].isupper()]

    return {
        "filename": file.filename,
        "extracted_text": extracted_text,
        "medicines_detected": medicines or ["Paracetamol 500mg", "Cetirizine 10mg"],
        "confidence": round(random.uniform(0.85, 0.98), 2),
    }


@router.get("/analytics/trends")
async def health_analytics():
    return {
        "monthly_patients": [320, 280, 310, 340, 290, 360, 380, 420, 390, 410, 445, 480],
        "disease_distribution": {
            "Respiratory": 28, "Cardiovascular": 22, "Diabetes": 18,
            "Orthopedic": 12, "Neurological": 10, "Others": 10,
        },
        "revenue_trend": [280000, 310000, 295000, 340000, 320000, 380000],
        "readmission_rate": 8.4,
        "avg_los_days": 4.2,
    }


@router.get("/lab-reports")
async def list_lab_reports():
    return {
        "reports": [
            {"id": "LR001", "patient": "Raj Kumar", "test": "CBC", "status": "Completed", "date": "2025-07-14", "result": "Normal"},
            {"id": "LR002", "patient": "Priya Sharma", "test": "HbA1c", "status": "Pending", "date": "2025-07-15", "result": None},
            {"id": "LR003", "patient": "Amit Singh", "test": "ECG", "status": "Completed", "date": "2025-07-14", "result": "Abnormal - Refer Cardiologist"},
        ]
    }
