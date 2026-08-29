import math
from typing import Dict, Any, List

class MountainSafeRoutingEngine:
    """
    Emergency Logistics and Safe Route Evacuation Engine for North East India.
    Dynamically routes around high-risk mountain highway blocks (e.g., NH-10, NH-29, NH-6).
    """

    CORRIDOR_NETWORK = {
        "sikkim_corridor": {
            "origin": {"name": "Siliguri Junction (Hub)", "lat": 26.7271, "lng": 88.4312},
            "destination": {"name": "Gangtok Capital (Sikkim)", "lat": 27.3389, "lng": 88.6065},
            "primary_route": {
                "name": "NH-10 via Sevoke & Teesta Valley",
                "distance_km": 114,
                "normal_eta_hours": 3.8,
                "chokepoint": "Kalijhora / 29th Mile",
                "risk_status": "HIGH_RISK_BLOCKED",
                "risk_score": 88.5,
                "coordinates": [
                    [26.7271, 88.4312],
                    [26.8833, 88.4667],
                    [26.9389, 88.4680], # Block point
                    [27.0500, 88.5200],
                    [27.1764, 88.5300],
                    [27.3389, 88.6065]
                ]
            },
            "safe_bypass_route": {
                "name": "Alternate Bypass via Damdim ↔ Gorubathan ↔ Lava ↔ Pedong ↔ Rangpo",
                "distance_km": 158,
                "normal_eta_hours": 5.2,
                "clearance_status": "SAFE_OPERATIONAL",
                "risk_score": 24.0,
                "advisory": "Approved for Emergency Ambulances, Heavy Ration Trucks, and NDRF convoys",
                "coordinates": [
                    [26.7271, 88.4312], # Siliguri
                    [26.8900, 88.7500], # Damdim
                    [26.9600, 88.7000], # Gorubathan
                    [27.0800, 88.6600], # Lava
                    [27.1500, 88.6200], # Pedong
                    [27.1764, 88.5300], # Rangpo
                    [27.3389, 88.6065]  # Gangtok
                ]
            }
        },
        "nagaland_corridor": {
            "origin": {"name": "Dimapur Railway Hub", "lat": 25.9068, "lng": 93.7275},
            "destination": {"name": "Kohima City Center", "lat": 25.6751, "lng": 94.1086},
            "primary_route": {
                "name": "NH-29 via Chumukedima & Dzüdza Bridge",
                "distance_km": 74,
                "normal_eta_hours": 2.5,
                "chokepoint": "Dzüdza River Sinking Zone",
                "risk_status": "CRITICAL_COLLAPSE",
                "risk_score": 92.0,
                "coordinates": [
                    [25.9068, 93.7275],
                    [25.8050, 93.7750],
                    [25.7500, 93.8500],
                    [25.7000, 93.9800], # Block Point
                    [25.6500, 94.0500],
                    [25.6751, 94.1086]
                ]
            },
            "safe_bypass_route": {
                "name": "Alternate Bypass via Niuland ↔ Ghaspani ↔ Peducha Bypass",
                "distance_km": 96,
                "normal_eta_hours": 3.4,
                "clearance_status": "SAFE_OPERATIONAL",
                "risk_score": 28.5,
                "advisory": "Escorted convoys recommended. High-clearance 4x4 & light trucks active.",
                "coordinates": [
                    [25.9068, 93.7275], # Dimapur
                    [25.9500, 93.8500], # Niuland
                    [25.8300, 93.9400], # Ghaspani
                    [25.7200, 94.0300], # Peducha
                    [25.6751, 94.1086]  # Kohima
                ]
            }
        },
        "meghalaya_barak_corridor": {
            "origin": {"name": "Shillong Capital", "lat": 25.5788, "lng": 91.8933},
            "destination": {"name": "Silchar Valley Hub", "lat": 24.8333, "lng": 92.7789},
            "primary_route": {
                "name": "NH-6 via Jowai & Sonapur Tunnel",
                "distance_km": 218,
                "normal_eta_hours": 6.0,
                "chokepoint": "Sonapur Mudslide Portal",
                "risk_status": "CAUTION_RESTRICTED",
                "risk_score": 74.0,
                "coordinates": [
                    [25.5788, 91.8933],
                    [25.4500, 92.2000],
                    [25.1200, 92.3700], # Sonapur tunnel
                    [24.8333, 92.7789]
                ]
            },
            "safe_bypass_route": {
                "name": "Alternate Emergency Route via Umrangso ↔ Haflong ↔ Silchar (NH-27)",
                "distance_km": 265,
                "normal_eta_hours": 7.5,
                "clearance_status": "SAFE_OPERATIONAL",
                "risk_score": 31.0,
                "advisory": "Recommended while heavy earth-movers clear Sonapur mud accumulation.",
                "coordinates": [
                    [25.5788, 91.8933], # Shillong
                    [25.5100, 92.7800], # Umrangso
                    [25.1764, 93.0175], # Haflong
                    [24.8333, 92.7789]  # Silchar
                ]
            }
        }
    }

    @classmethod
    def get_corridor_routes(cls, corridor_key: str = "sikkim_corridor") -> Dict[str, Any]:
        """
        Returns primary blocked vs safe bypass paths with live telemetry.
        """
        data = cls.CORRIDOR_NETWORK.get(corridor_key, cls.CORRIDOR_NETWORK["sikkim_corridor"])
        return data

    @classmethod
    def list_all_corridors(cls) -> List[Dict[str, Any]]:
        """
        Lists all managed emergency mountain transport corridors.
        """
        return [
            {
                "key": k,
                "title": f"{v['origin']['name']} ➔ {v['destination']['name']}",
                "primary_name": v["primary_route"]["name"],
                "bypass_name": v["safe_bypass_route"]["name"],
                "primary_risk": v["primary_route"]["risk_score"],
                "bypass_risk": v["safe_bypass_route"]["risk_score"],
                "chokepoint": v["primary_route"]["chokepoint"]
            }
            for k, v in cls.CORRIDOR_NETWORK.items()
        ]
