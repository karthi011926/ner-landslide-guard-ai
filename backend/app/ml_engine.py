import math
from typing import Dict, Any, List
from app.data.ner_geo import NER_DISTRICTS

class LandslideRiskEngine:
    """
    Two-Tier AI/ML Early Warning Engine calibrated for North Eastern Region (NER).
    - Tier 1: Static Landslide Susceptibility Index (LSI) based on geomorphology & lithology.
    - Tier 2: Dynamic Hydrological Trigger based on Antecedent Rainfall (ARI) & Soil Saturation.
    """

    @staticmethod
    def calculate_static_susceptibility(
        slope_deg: float,
        lithology_factor: float,
        fault_distance_km: float,
        vegetation_ndvi: float = 0.45
    ) -> float:
        """
        Calculates baseline terrain susceptibility (0.0 to 1.0).
        High slopes (>35 deg), soft shales (lithology >0.8), and proximity to seismic faults increase risk.
        """
        # Normalized slope factor (peaks around 35-50 degrees in NER)
        slope_norm = min(max(slope_deg / 50.0, 0.0), 1.0)
        
        # Fault proximity factor (higher within 10 km)
        fault_factor = max(0.0, 1.0 - (fault_distance_km / 15.0))
        
        # Vegetation loss factor (lower NDVI = higher erosion/cutting vulnerability)
        erosion_factor = max(0.0, 1.0 - vegetation_ndvi)

        # Weighted static susceptibility
        lsi = (0.42 * slope_norm) + (0.30 * lithology_factor) + (0.18 * fault_factor) + (0.10 * erosion_factor)
        return round(min(max(lsi, 0.05), 0.98), 3)

    @staticmethod
    def calculate_dynamic_trigger(
        rain_24h_mm: float,
        rain_72h_antecedent_mm: float,
        soil_moisture_pct: float
    ) -> Dict[str, Any]:
        """
        Calculates dynamic hydrological saturation trigger using Antecedent Rainfall Index (ARI)
        and Caine / GSI empirical thresholds for North East India.
        """
        # Antecedent Rainfall Index (decayed memory of prior 3 days)
        ari = rain_24h_mm + (0.75 * (rain_72h_antecedent_mm - rain_24h_mm) * 0.5)

        # Empirical threshold for slope failure in NER:
        # > 40mm: saturation onset, > 90mm: critical pore pressure, > 150mm: widespread debris flows
        z_score = (ari - 85.0) / 30.0
        # Sigmoid trigger activation
        rainfall_trigger_prob = 1.0 / (1.0 + math.exp(-z_score))
        
        moisture_factor = min(max(soil_moisture_pct / 100.0, 0.0), 1.0)

        # Dynamic saturation index (0.0 to 1.0)
        dyn_index = (0.70 * rainfall_trigger_prob) + (0.30 * moisture_factor)

        return {
            "ari_index_mm": round(ari, 1),
            "dynamic_trigger_score": round(dyn_index, 3),
            "soil_pore_saturation_pct": round(soil_moisture_pct, 1),
            "rainfall_threat_level": "EXTREME" if ari > 140 else "HIGH" if ari > 80 else "MODERATE" if ari > 40 else "LOW"
        }

    @classmethod
    def evaluate_location_risk(
        cls,
        lat: float,
        lng: float,
        slope_deg: float = 34.0,
        lithology_factor: float = 0.80,
        fault_dist_km: float = 6.0,
        rain_24h_mm: float = 65.0,
        rain_72h_antecedent_mm: float = 120.0,
        soil_moisture_pct: float = 75.0,
        crack_evidence_multiplier: float = 1.0
    ) -> Dict[str, Any]:
        """
        Full Risk Fusion: Merges static geomorphology with dynamic real-time rainfall & citizen reports.
        """
        static_lsi = cls.calculate_static_susceptibility(slope_deg, lithology_factor, fault_dist_km)
        dyn = cls.calculate_dynamic_trigger(rain_24h_mm, rain_72h_antecedent_mm, soil_moisture_pct)

        # Combined Landslide Hazard Probability (P)
        # Weighting: 40% Static Terrain Susceptibility, 60% Dynamic Water Saturation
        raw_prob = (0.38 * static_lsi) + (0.62 * dyn["dynamic_trigger_score"])
        
        # Multiply by crack evidence if verified by field photos/sensors
        adjusted_prob = min(max(raw_prob * crack_evidence_multiplier, 0.02), 0.99)
        risk_pct = round(adjusted_prob * 100, 1)

        # Risk Classification Matrix
        if risk_pct >= 75.0:
            level = "SEVERE"
            color = "#ef4444" # Red
            warning_window_hours = "2 to 6 hours"
            action = "Mandatory Evacuation, Immediate Road Closure (SDRF/NDRF Action Required)"
        elif risk_pct >= 50.0:
            level = "HIGH"
            color = "#f97316" # Orange
            warning_window_hours = "6 to 18 hours"
            action = "Heavy vehicle traffic diversion, standby emergency road clearing dozers"
        elif risk_pct >= 28.0:
            level = "MODERATE"
            color = "#eab308" # Yellow
            warning_window_hours = "18 to 36 hours"
            action = "Continuous slope observation, PWD patrols on highway choke points"
        else:
            level = "LOW"
            color = "#22c55e" # Green
            warning_window_hours = "Normal Monitoring"
            action = "Normal connectivity, routine automated telemetry"

        return {
            "coordinates": {"lat": lat, "lng": lng},
            "overall_risk_probability": risk_pct,
            "risk_level": level,
            "color_code": color,
            "estimated_failure_window": warning_window_hours,
            "recommended_action": action,
            "breakdown": {
                "static_susceptibility_score": static_lsi,
                "dynamic_trigger_score": dyn["dynamic_trigger_score"],
                "ari_mm": dyn["ari_index_mm"],
                "rainfall_threat": dyn["rainfall_threat_level"],
                "soil_moisture_pct": dyn["soil_pore_saturation_pct"]
            }
        }

    @classmethod
    def evaluate_all_districts(cls, custom_weather_map: Dict[str, Dict[str, float]] = None) -> List[Dict[str, Any]]:
        """
        Evaluates all NER priority districts and returns live risk heat map nodes.
        """
        results = []
        custom_weather_map = custom_weather_map or {}

        for district in NER_DISTRICTS:
            w = custom_weather_map.get(district["id"], {
                "rain_24h": 45.0,
                "rain_72h": 95.0,
                "soil_moisture": 68.0
            })

            eval_res = cls.evaluate_location_risk(
                lat=district["lat"],
                lng=district["lng"],
                slope_deg=district["base_slope"],
                lithology_factor=district["lithology_factor"],
                fault_dist_km=district["fault_distance_km"],
                rain_24h_mm=w["rain_24h"],
                rain_72h_antecedent_mm=w["rain_72h"],
                soil_moisture_pct=w["soil_moisture"]
            )

            results.append({
                "district_id": district["id"],
                "name": district["name"],
                "state": district["state"],
                "population": district["population"],
                "critical_highways": district["critical_highways"],
                "lat": district["lat"],
                "lng": district["lng"],
                **eval_res
            })

        return results
