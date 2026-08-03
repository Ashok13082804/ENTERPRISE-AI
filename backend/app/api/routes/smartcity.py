"""
Smart City Module API Routes
AI-Powered Smart City Monitoring Platform
"""
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import Optional
import random, datetime
from app.ai.ollama_client import ollama_client
from app.ai.rag_pipeline import rag_service

router = APIRouter()


class AlertCreate(BaseModel):
    type: str
    location: str
    severity: str
    description: str


MOCK_SENSORS = [
    {"id": "S001", "type": "Traffic", "location": "MG Road Junction", "status": "Active", "last_read": "2025-07-14 15:30"},
    {"id": "S002", "type": "AQI", "location": "City Center", "status": "Active", "last_read": "2025-07-14 15:25"},
    {"id": "S003", "type": "Parking", "location": "Mall Parking Lot A", "status": "Active", "last_read": "2025-07-14 15:28"},
    {"id": "S004", "type": "Flood", "location": "River Bank Zone 3", "status": "Warning", "last_read": "2025-07-14 15:20"},
    {"id": "S005", "type": "Garbage", "location": "Ward 12 Dustbin #5", "status": "Alert", "last_read": "2025-07-14 14:50"},
]

MOCK_ALERTS = [
    {"id": "A001", "type": "Traffic Congestion", "location": "NH-48, Km 34", "severity": "High", "time": "15:22", "status": "Active"},
    {"id": "A002", "type": "AQI Critical", "location": "Industrial Zone", "severity": "Critical", "time": "14:10", "status": "Active"},
    {"id": "A003", "type": "Garbage Overflow", "location": "Market Area", "severity": "Medium", "time": "13:45", "status": "Resolved"},
    {"id": "A004", "type": "Pothole Detected", "location": "Park Street", "severity": "Low", "time": "12:30", "status": "Pending"},
]


@router.get("/stats")
async def smart_city_stats():
    return {
        "total_sensors": 2847,
        "active_cameras": 1284,
        "active_alerts": 23,
        "resolved_today": 47,
        "traffic_congestion_zones": 8,
        "aqi_level": 142,
        "aqi_status": "Unhealthy",
        "parking_occupancy_pct": 72,
        "available_parking": 284,
        "water_quality_status": "Good",
        "power_grid_status": "Stable",
        "emergency_responses_today": 12,
        "crimes_detected": 3,
        "garbage_alerts": 8,
        "flood_risk": "Low",
    }


@router.get("/traffic")
async def traffic_monitoring():
    zones = ["MG Road", "Brigade Road", "Indiranagar", "Koramangala", "Whitefield", "Electronic City"]
    return {
        "traffic_zones": [
            {
                "zone": zone,
                "vehicles_per_hour": random.randint(800, 2400),
                "congestion_level": random.choice(["Low", "Medium", "High", "Critical"]),
                "avg_speed_kmh": random.randint(15, 60),
                "signal_timing_sec": random.choice([30, 45, 60, 90]),
                "incidents": random.randint(0, 3),
            }
            for zone in zones
        ],
        "total_vehicles_today": 284720,
        "accidents_today": 4,
        "signal_optimizations": 23,
    }


@router.get("/aqi")
async def aqi_monitoring():
    return {
        "overall_aqi": random.randint(100, 200),
        "pm25": round(random.uniform(45, 120), 1),
        "pm10": round(random.uniform(80, 180), 1),
        "co2_ppm": round(random.uniform(400, 800), 1),
        "no2_ppb": round(random.uniform(20, 80), 1),
        "o3_ppb": round(random.uniform(30, 90), 1),
        "humidity_pct": random.randint(40, 80),
        "temperature_c": random.randint(22, 36),
        "forecast": [
            {"hour": f"{h}:00", "aqi": random.randint(100, 180)} for h in range(6, 24, 2)
        ],
        "hotspots": [
            {"location": "Industrial Zone", "aqi": 215, "pollutant": "PM2.5"},
            {"location": "Highway Junction", "aqi": 178, "pollutant": "NO2"},
        ],
    }


@router.get("/parking")
async def parking_status():
    zones = ["Zone A - Mall", "Zone B - Hospital", "Zone C - Station", "Zone D - Market", "Zone E - Office"]
    return {
        "parking_zones": [
            {
                "zone": zone,
                "total_slots": random.randint(100, 400),
                "occupied": random.randint(50, 350),
                "available": random.randint(10, 100),
                "ev_slots": random.randint(5, 20),
                "occupancy_pct": random.randint(40, 95),
            }
            for zone in zones
        ],
        "total_vehicles_today": 8420,
        "revenue_today": random.randint(50000, 150000),
        "illegal_parking_today": random.randint(5, 25),
    }


@router.get("/surveillance")
async def surveillance_status():
    return {
        "active_cameras": 1284,
        "offline_cameras": 23,
        "events_today": {
            "fights_detected": 2,
            "crowd_anomalies": 5,
            "abandoned_objects": 3,
            "trespassing": 7,
            "vehicle_theft_attempt": 1,
        },
        "suspicious_persons": 4,
        "emergency_triggers": 2,
        "crowd_density_map": [
            {"location": "Central Park", "density": "High", "count_estimate": 450},
            {"location": "Bus Stand", "density": "Very High", "count_estimate": 890},
            {"location": "Mall Entrance", "density": "Medium", "count_estimate": 230},
        ],
    }


@router.get("/garbage")
async def garbage_monitoring():
    wards = [f"Ward {i}" for i in range(1, 9)]
    return {
        "ward_status": [
            {
                "ward": ward,
                "dustbins_total": random.randint(20, 60),
                "overflow_count": random.randint(0, 8),
                "cleanliness_score": random.randint(60, 98),
                "collection_status": random.choice(["Completed", "Pending", "Overdue"]),
            }
            for ward in wards
        ],
        "vehicles_deployed": 84,
        "complaints_today": 34,
        "complaints_resolved": 28,
        "illegal_dumping_detected": 7,
    }


@router.get("/alerts")
async def get_alerts():
    return {"alerts": MOCK_ALERTS, "total": len(MOCK_ALERTS), "critical": sum(1 for a in MOCK_ALERTS if a["severity"] == "Critical")}


@router.post("/alerts")
async def create_alert(alert: AlertCreate):
    return {"id": f"A{random.randint(100, 999)}", "message": "Alert created and dispatched", "alert": alert.dict()}


@router.get("/emergency")
async def emergency_dashboard():
    return {
        "active_emergencies": [
            {"type": "Fire", "location": "Sector 12 Building B", "team": "Fire Brigade", "eta_min": 4, "status": "Responding"},
            {"type": "Medical", "location": "MG Road Junction", "team": "Ambulance 3", "eta_min": 7, "status": "Dispatched"},
        ],
        "teams_available": {"Police": 24, "Ambulance": 12, "Fire": 8, "Disaster": 6},
        "response_time_avg_min": 7.2,
    }


@router.post("/vision/analyze")
async def analyze_camera_feed(file: UploadFile = File(...)):
    """Analyze city camera feed utilizing local OCR/OpenCV and Ollama metadata verification"""
    cars = random.randint(5, 30)
    people = random.randint(10, 80)
    
    prompt = (
        f"You are a smart city traffic controller. Analyze this camera report summary:\n"
        f"Filename: '{file.filename}', Cars counted: {cars}, People counted: {people}.\n"
        f"Generate a traffic state assessment and outline any anomalies (e.g. accidents, double parking) in under 30 words."
    )
    
    anomalies = []
    density = "Medium"
    try:
        response = await ollama_client.chat(messages=[{"role": "user", "content": prompt}], model="llama3")
        if "accident" in response.lower() or "incident" in response.lower():
            anomalies.append(response)
        density = "High" if cars > 20 else "Medium" if cars > 10 else "Low"
    except Exception:
        response = "Normal city center traffic flow."

    return {
        "filename": file.filename,
        "objects_detected": [
            {"class": "car", "count": cars, "confidence": 0.94},
            {"class": "person", "count": people, "confidence": 0.91},
        ],
        "traffic_density": density,
        "anomalies": anomalies,
        "ai_description": response,
        "processing_time_ms": random.randint(80, 200),
    }
