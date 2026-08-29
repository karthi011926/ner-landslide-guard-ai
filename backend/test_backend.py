"""
Quick verification script for backend ML, Chatbot, and API modules.
"""
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from app.ml_engine import LandslideRiskEngine
from app.cv_verifier import EdgeAIVisionVerifier
from app.routing_engine import MountainSafeRoutingEngine
from app.alert_service import MultilingualAlertService
from app.weather_service import WeatherDataService
from app.chatbot_service import NERDisasterChatbot
from app.database import init_db, add_report, get_all_reports

def test_all():
    print("Testing ML Risk Engine...")
    res = LandslideRiskEngine.evaluate_location_risk(
        lat=27.3389, lng=88.6065, slope_deg=38.5, lithology_factor=0.85,
        rain_24h_mm=110.0, rain_72h_antecedent_mm=220.0, soil_moisture_pct=88.0
    )
    print(f"Risk Probability: {res['overall_risk_probability']}% | Level: {res['risk_level']}")
    assert res['risk_level'] in ['HIGH', 'SEVERE']

    print("\nTesting Weather & Scenarios...")
    scenarios = WeatherDataService.get_weather_for_scenario("cloudburst_monsoon")
    print(f"Total districts mapped: {len(scenarios)}")
    assert len(scenarios) > 5

    print("\nTesting Voice & Multilingual AI Disaster Chatbot Engine...")
    chat_nh10 = NERDisasterChatbot.process_query("Is NH-10 open to Gangtok?")
    print(f"Chatbot [NH-10 Query Title]: {chat_nh10['title']}")
    assert "NH-10" in chat_nh10['title'] or "Gangtok" in chat_nh10['answer']

    chat_crack = NERDisasterChatbot.process_query("I saw a tension crack on the road")
    print(f"Chatbot [Crack Reporting Title]: {chat_crack['title']}")
    assert "photo" in chat_crack['answer'] or "camera" in chat_crack['answer'] or "crack" in chat_crack['title'].lower()

    chat_help = NERDisasterChatbot.process_query("What are the SDRF helpline numbers?")
    print(f"Chatbot [Helplines Title]: {chat_help['title']}")
    assert "1070" in chat_help['answer'] or "112" in chat_help['answer']

    # Test Hindi Voice input
    chat_hi = NERDisasterChatbot.process_query("क्या सिक्किम का रास्ता बंद है?")
    print(f"Chatbot [Hindi Voice]: {chat_hi['title']} -> {chat_hi['answer'][:60]}...")
    assert chat_hi['lang'] == "hi"

    print("\nTesting Mountain Routing Engine...")
    corridor = MountainSafeRoutingEngine.get_corridor_routes("sikkim_corridor")
    print(f"Bypass: {corridor['safe_bypass_route']['name']} ({corridor['safe_bypass_route']['distance_km']} km)")
    assert len(corridor['safe_bypass_route']['coordinates']) > 3

    print("\nTesting Multilingual Alerts...")
    alert = MultilingualAlertService.generate_multilingual_alert("East Sikkim", "SEVERE")
    print(f"Supported languages: {len(alert['translations'])}")
    assert len(alert['translations']) == 8
    print(f"Assamese: {alert['translations']['as']['text']}")

    print("\nTesting GSM SMS Decoder...")
    sms_res = MultilingualAlertService.decode_field_sms("#SLIDE 25.689 93.992 4 CRITICAL_ROAD_COLLAPSE")
    print(f"Decoded: {sms_res['extracted_data']}")
    assert sms_res['success'] is True

    print("\nTesting Database Storage...")
    init_db()
    reports = get_all_reports()
    print(f"Seeded Field Reports Count: {len(reports)}")
    assert len(reports) >= 3

    print("\n All Backend, Voice-First AI Chatbot & ML Modules Tested Successfully!")

if __name__ == "__main__":
    test_all()
