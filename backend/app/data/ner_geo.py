"""
Geospatial metadata, district profiles, high-risk highway corridors,
and historical landslide hotspots across the North Eastern Region (NER).
"""

NER_DISTRICTS = [
    {
        "id": "sk_east",
        "name": "East Sikkim (Gangtok)",
        "state": "Sikkim",
        "lat": 27.3389,
        "lng": 88.6065,
        "base_slope": 38.5,       # Steep terrain in degrees
        "lithology_factor": 0.85, # High phyllite/schist fragility
        "fault_distance_km": 4.2, # Near Main Central Thrust (MCT)
        "vulnerability_score": 0.88,
        "critical_highways": ["NH-10"],
        "population": 283583
    },
    {
        "id": "sk_south",
        "name": "Namchi (South Sikkim)",
        "state": "Sikkim",
        "lat": 27.1667,
        "lng": 88.3500,
        "base_slope": 34.0,
        "lithology_factor": 0.78,
        "fault_distance_km": 8.1,
        "vulnerability_score": 0.79,
        "critical_highways": ["NH-10", "NH-510"],
        "population": 146850
    },
    {
        "id": "mg_ekh",
        "name": "East Khasi Hills (Shillong/Cherrapunji)",
        "state": "Meghalaya",
        "lat": 25.5788,
        "lng": 91.8933,
        "base_slope": 31.0,
        "lithology_factor": 0.72,
        "fault_distance_km": 12.0,
        "vulnerability_score": 0.84, # World's highest rainfall corridor
        "critical_highways": ["NH-6", "SH-5"],
        "population": 825922
    },
    {
        "id": "mg_wkh",
        "name": "West Khasi Hills (Nongstoin)",
        "state": "Meghalaya",
        "lat": 25.5200,
        "lng": 91.2700,
        "base_slope": 28.5,
        "lithology_factor": 0.65,
        "fault_distance_km": 15.4,
        "vulnerability_score": 0.68,
        "critical_highways": ["NH-127B"],
        "population": 383461
    },
    {
        "id": "nl_koh",
        "name": "Kohima",
        "state": "Nagaland",
        "lat": 25.6751,
        "lng": 94.1086,
        "base_slope": 36.2,
        "lithology_factor": 0.90, # Highly weathered Disang shales
        "fault_distance_km": 5.0,
        "vulnerability_score": 0.92,
        "critical_highways": ["NH-29"],
        "population": 267988
    },
    {
        "id": "nl_dim",
        "name": "Chumukedima / Dimapur Corridor",
        "state": "Nagaland",
        "lat": 25.8050,
        "lng": 93.7750,
        "base_slope": 26.0,
        "lithology_factor": 0.75,
        "fault_distance_km": 7.8,
        "vulnerability_score": 0.74,
        "critical_highways": ["NH-29"],
        "population": 378811
    },
    {
        "id": "as_dima",
        "name": "Dima Hasao (Haflong)",
        "state": "Assam",
        "lat": 25.1764,
        "lng": 93.0175,
        "base_slope": 33.5,
        "lithology_factor": 0.88, # Barail shale & soft sandstone
        "fault_distance_km": 6.5,
        "vulnerability_score": 0.91,
        "critical_highways": ["NH-27", "Lumding-Badarpur Rail"],
        "population": 214102
    },
    {
        "id": "mz_aiz",
        "name": "Aizawl",
        "state": "Mizoram",
        "lat": 23.7271,
        "lng": 92.7176,
        "base_slope": 37.0,
        "lithology_factor": 0.86, # Surma Group siltstones
        "fault_distance_km": 9.2,
        "vulnerability_score": 0.87,
        "critical_highways": ["NH-306", "NH-54"],
        "population": 400309
    },
    {
        "id": "mn_imp",
        "name": "Senapati / Imphal West",
        "state": "Manipur",
        "lat": 25.2600,
        "lng": 94.0200,
        "base_slope": 32.0,
        "lithology_factor": 0.82,
        "fault_distance_km": 8.0,
        "vulnerability_score": 0.80,
        "critical_highways": ["NH-2", "NH-37"],
        "population": 479148
    },
    {
        "id": "ar_taw",
        "name": "Tawang",
        "state": "Arunachal Pradesh",
        "lat": 27.5861,
        "lng": 91.8594,
        "base_slope": 42.0,
        "lithology_factor": 0.89, # High-altitude glacial moraines & gneiss
        "fault_distance_km": 3.5,
        "vulnerability_score": 0.94,
        "critical_highways": ["NH-13", "Balipara-Charduar-Tawang"],
        "population": 49977
    }
]

# Highway Corridors with waypoints and risk zones
HIGHWAY_CORRIDORS = [
    {
        "id": "nh-10",
        "name": "NH-10: Siliguri ↔ Gangtok (Sikkim Lifeline)",
        "state": "Sikkim / WB",
        "color": "#ef4444",
        "total_length_km": 114,
        "vulnerable_stretch": "Sevoke - Kalijhora - 29th Mile - Rangpo",
        "coordinates": [
            [26.7271, 88.4312], # Siliguri
            [26.8833, 88.4667], # Sevoke Coronation Bridge
            [26.9389, 88.4680], # Kalijhora (High Slide Zone)
            [27.0500, 88.5200], # 29th Mile (Birik Dara)
            [27.1764, 88.5300], # Rangpo Border
            [27.2345, 88.5500], # Singtam
            [27.3389, 88.6065]  # Gangtok
        ],
        "default_status": "RESTRICTED",
        "risk_reason": "Teesta river scouring + fragile slope cuttings"
    },
    {
        "id": "nh-29",
        "name": "NH-29: Dimapur ↔ Kohima (Nagaland Lifeline)",
        "state": "Nagaland",
        "color": "#f97316",
        "total_length_km": 74,
        "vulnerable_stretch": "Chumukedima - Phesama - Dzüdza Bridge",
        "coordinates": [
            [25.9068, 93.7275], # Dimapur
            [25.8050, 93.7750], # Chumukedima
            [25.7500, 93.8500], # Medziphema
            [25.7000, 93.9800], # Dzüdza River Sinking Zone
            [25.6500, 94.0500], # Zubza
            [25.6751, 94.1086]  # Kohima
        ],
        "default_status": "HIGH_RISK",
        "risk_reason": "Sinking zone at Dzüdza river valley & shale mudslides"
    },
    {
        "id": "nh-6",
        "name": "NH-6: Guwahati ↔ Shillong ↔ Silchar (Barak Valley Link)",
        "state": "Meghalaya / Assam",
        "color": "#3b82f6",
        "total_length_km": 300,
        "vulnerable_stretch": "Umiam - Jowai - Sonapur Tunnel",
        "coordinates": [
            [26.1445, 91.7362], # Guwahati
            [25.9000, 91.8800], # Nongpoh
            [25.5788, 91.8933], # Shillong
            [25.4500, 92.2000], # Jowai
            [25.1200, 92.3700], # Sonapur Mudslide Tunnel
            [24.8333, 92.7789]  # Silchar
        ],
        "default_status": "CAUTION",
        "risk_reason": "Sonapur flash mudflows & limestone karst collapses"
    },
    {
        "id": "nh-27",
        "name": "NH-27: Nagaon ↔ Haflong (Dima Hasao Hill Section)",
        "state": "Assam",
        "color": "#8b5cf6",
        "total_length_km": 190,
        "vulnerable_stretch": "Lumding - Maibang - Haflong - Jatinga",
        "coordinates": [
            [26.3475, 92.6841], # Nagaon
            [25.7500, 93.1700], # Lumding
            [25.3000, 93.1500], # Maibang
            [25.1764, 93.0175], # Haflong Hill Section
            [24.9500, 92.8500]  # Jatinga Lampur
        ],
        "default_status": "MODERATE",
        "risk_reason": "Barail soft sandstone slips cutting rail & road networks"
    }
]

# Historical Major Landslide Hotspots in NER with real coordinates
HISTORICAL_HOTSPOTS = [
    {
        "id": "spot_1",
        "name": "Paglajhora Sinking Area",
        "state": "Sikkim/WB Border",
        "lat": 26.8950,
        "lng": 88.3120,
        "type": "Debris Flow & Sinking Road",
        "trigger_rain_mm": 180,
        "severity": "CRITICAL",
        "last_incident": "July 2024"
    },
    {
        "id": "spot_2",
        "name": "Dzüdza River Bridge Mudslide",
        "state": "Nagaland (NH-29)",
        "lat": 25.6890,
        "lng": 93.9920,
        "type": "Massive Mudflow & Hill Slump",
        "trigger_rain_mm": 120,
        "severity": "CRITICAL",
        "last_incident": "August 2024"
    },
    {
        "id": "spot_3",
        "name": "Sonapur Tunnel Choke Point",
        "state": "Meghalaya (NH-6)",
        "lat": 25.1150,
        "lng": 92.3680,
        "type": "Sudden Mudslide & Silt Inundation",
        "trigger_rain_mm": 210,
        "severity": "HIGH",
        "last_incident": "June 2024"
    },
    {
        "id": "spot_4",
        "name": "Dima Hasao New Haflong Section",
        "state": "Assam (Hill Section)",
        "lat": 25.1680,
        "lng": 93.0250,
        "type": "Slope Failure & Track Washout",
        "trigger_rain_mm": 250,
        "severity": "CRITICAL",
        "last_incident": "May 2024"
    },
    {
        "id": "spot_5",
        "name": "Lunglei Chanmari Slope",
        "state": "Mizoram",
        "lat": 22.8850,
        "lng": 92.7400,
        "type": "Settlement Rockslide",
        "trigger_rain_mm": 140,
        "severity": "HIGH",
        "last_incident": "September 2024"
    }
]
