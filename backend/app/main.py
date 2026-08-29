import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.data.ner_geo import NER_DISTRICTS, HIGHWAY_CORRIDORS, HISTORICAL_HOTSPOTS
from app.ml_engine import LandslideRiskEngine
from app.cv_verifier import EdgeAIVisionVerifier
from app.routing_engine import MountainSafeRoutingEngine
from app.alert_service import MultilingualAlertService
from app.weather_service import WeatherDataService
from app.chatbot_service import NERDisasterChatbot
from app.database import init_db, add_report, get_all_reports, add_dispatch, get_all_dispatches

# Initialize SQLite database
init_db()

app = FastAPI(
    title="NER Landslide Guard AI - Early Warning & Monitoring Engine",
    description="Intelligent Landslide Risk Prediction, Edge-AI Vision, and Safe Evacuation Routing for North East India",
    version="1.0.0"
)

# Enable CORS for frontend dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RiskEvaluateRequest(BaseModel):
    lat: float
    lng: float
    slope_deg: float = 35.0
    lithology_factor: float = 0.85
    fault_dist_km: float = 5.0
    rain_24h_mm: float = 65.0
    rain_72h_antecedent_mm: float = 130.0
    soil_moisture_pct: float = 75.0
    crack_multiplier: float = 1.0

class ReportSubmitRequest(BaseModel):
    lat: float
    lng: float
    location_name: str
    hazard_type: str
    severity: str
    confidence_pct: float
    description: str
    image_url: Optional[str] = ""
    reporter_role: str = "Citizen / Field Worker"

class DispatchRequest(BaseModel):
    report_id: Optional[int] = 0
    team_name: str
    target_location: str
    priority: str
    assigned_route: str

class SMSDecodeRequest(BaseModel):
    sms_text: str

class ChatbotQueryRequest(BaseModel):
    question: str
    scenario: Optional[str] = "cloudburst_monsoon"
    api_key: Optional[str] = None

@app.get("/")

def read_root():
    return {
        "system": "NER Landslide Guard AI",
        "status": "OPERATIONAL",
        "region": "North Eastern Region (NER) India",
        "supported_states": ["Sikkim", "Meghalaya", "Nagaland", "Assam", "Mizoram", "Manipur", "Arunachal Pradesh", "Tripura"],
        "api_docs": "/docs"
    }

@app.get("/api/districts/risk")
def get_districts_risk(scenario: str = "cloudburst_monsoon"):
    """
    Evaluates real-time / scenario-driven landslide risk across all NER priority districts.
    """
    weather_map = WeatherDataService.get_weather_for_scenario(scenario)
    evaluations = LandslideRiskEngine.evaluate_all_districts(weather_map)
    return {
        "scenario": scenario,
        "scenario_name": WeatherDataService.SCENARIOS.get(scenario, "Custom Simulation"),
        "total_districts": len(evaluations),
        "data": evaluations
    }

@app.post("/api/evaluate/custom")
def evaluate_custom_coordinate(req: RiskEvaluateRequest):
    """
    Custom geomorphic and rainfall risk calculation.
    """
    result = LandslideRiskEngine.evaluate_location_risk(
        lat=req.lat,
        lng=req.lng,
        slope_deg=req.slope_deg,
        lithology_factor=req.lithology_factor,
        fault_dist_km=req.fault_dist_km,
        rain_24h_mm=req.rain_24h_mm,
        rain_72h_antecedent_mm=req.rain_72h_antecedent_mm,
        soil_moisture_pct=req.soil_moisture_pct,
        crack_evidence_multiplier=req.crack_multiplier
    )
    return result

@app.get("/api/highways")
def get_highways():
    """
    Returns critical NER highway corridors with waypoints and chokepoint vulnerabilities.
    """
    return {"highways": HIGHWAY_CORRIDORS}

@app.get("/api/hotspots")
def get_hotspots():
    """
    Returns historical landslide hotspots.
    """
    return {"hotspots": HISTORICAL_HOTSPOTS}

@app.post("/api/reports/analyze-photo")
async def analyze_photo(file: UploadFile = File(...)):
    """
    Runs Edge/Server Computer Vision model to detect ground cracks, mudflow, and retaining wall bulges.
    """
    contents = await file.read()
    analysis = EdgeAIVisionVerifier.analyze_image_bytes(contents, filename=file.filename)
    return analysis

@app.post("/api/reports/submit")
def submit_report(report: ReportSubmitRequest):
    """
    Submits verified citizen/field report to database.
    """
    report_id = add_report(report.dict())
    return {
        "success": True,
        "report_id": report_id,
        "message": "Field report successfully submitted and verified by AI."
    }

@app.get("/api/reports")
def list_reports():
    """
    Retrieves all filed reports.
    """
    reports = get_all_reports()
    return {"reports": reports}

@app.post("/api/dispatches")
def create_dispatch(req: DispatchRequest):
    """
    Dispatches SDRF/NDRF rescue unit and logs safe route.
    """
    dispatch_id = add_dispatch(req.dict())
    return {
        "success": True,
        "dispatch_id": dispatch_id,
        "message": f"Rescue Unit '{req.team_name}' dispatched to {req.target_location} via {req.assigned_route}."
    }

@app.get("/api/dispatches")
def list_dispatches():
    """
    Retrieves all active emergency dispatches.
    """
    dispatches = get_all_dispatches()
    return {"dispatches": dispatches}

@app.get("/api/routes/corridor")
def get_corridor_route(corridor: str = "sikkim_corridor"):
    """
    Gets primary vs safe alternate bypass route for a specified corridor.
    """
    route_data = MountainSafeRoutingEngine.get_corridor_routes(corridor)
    return route_data

@app.get("/api/routes/all")
def list_all_corridors():
    """
    Lists all managed emergency mountain transport corridors.
    """
    return {"corridors": MountainSafeRoutingEngine.list_all_corridors()}

@app.get("/api/alerts/broadcast")
def generate_multilingual_alert(location: str = "East Khasi Hills / NH-6 Corridor", severity: str = "SEVERE"):
    """
    Generates localized early warning in 8 NER languages.
    """
    return MultilingualAlertService.generate_multilingual_alert(location, severity)

@app.post("/api/alerts/decode-sms")
def decode_field_sms(req: SMSDecodeRequest):
    """
    Decodes compressed emergency SMS from zero-connectivity mountain locations.
    """
    return MultilingualAlertService.decode_field_sms(req.sms_text)

@app.get("/api/weather/scenarios")
def get_weather_scenarios():
    """
    Returns available rainfall simulation scenarios.
    """
    return {"scenarios": WeatherDataService.SCENARIOS}

@app.post("/api/chat/ask")
def chat_with_disaster_ai(req: ChatbotQueryRequest):
    """
    Intelligent domain-specific AI chatbot for citizen & official inquiries.
    """
    return NERDisasterChatbot.process_query(req.question, req.scenario, req.api_key)


