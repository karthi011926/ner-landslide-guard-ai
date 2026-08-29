import sqlite3
import json
import time
from typing import Dict, Any, List

DB_PATH = "reports.db"

def get_db():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS field_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        location_name TEXT,
        hazard_type TEXT,
        severity TEXT,
        confidence_pct REAL,
        description TEXT,
        image_url TEXT,
        reporter_role TEXT,
        is_verified INTEGER DEFAULT 1,
        status TEXT DEFAULT 'PENDING_DISPATCH',
        created_at REAL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS emergency_dispatches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        team_name TEXT,
        target_location TEXT,
        priority TEXT,
        assigned_route TEXT,
        status TEXT DEFAULT 'DEPLOYED',
        dispatched_at REAL
    )
    """)

    conn.commit()

    # Seed with realistic initial field reports if empty
    cursor.execute("SELECT COUNT(*) as count FROM field_reports")
    if cursor.fetchone()["count"] == 0:
        initial_reports = [
            (
                26.9389, 88.4680, "NH-10 Kalijhora (Sikkim Link)", "TENSION_CRACK", "SEVERE", 96.4,
                "Deep 12-inch longitudinal asphalt fissure detected on hillside shoulder.",
                "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format&fit=crop&q=60",
                "PWD Field Officer", 1, "ACTION_DISPATCHED", time.time() - 3600
            ),
            (
                25.6890, 93.9920, "NH-29 Dzüdza Sinking Valley (Nagaland)", "DEBRIS_MUDFLOW", "SEVERE", 98.1,
                "Continuous mudflow engulfing 40m stretch of carriageway. Boulders shifting.",
                "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=600&auto=format&fit=crop&q=60",
                "Traffic Patrol", 1, "ACTION_DISPATCHED", time.time() - 7200
            ),
            (
                25.1150, 92.3680, "Sonapur Tunnel Portal (Meghalaya)", "WALL_BULGE", "HIGH", 91.5,
                "Retaining wall shear crack and silt runoff near tunnel entrance.",
                "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=60",
                "Local Citizen", 1, "VERIFIED", time.time() - 14400
            )
        ]
        cursor.executemany("""
        INSERT INTO field_reports 
        (lat, lng, location_name, hazard_type, severity, confidence_pct, description, image_url, reporter_role, is_verified, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_reports)
        conn.commit()

    conn.close()

def add_report(report_data: Dict[str, Any]) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO field_reports 
    (lat, lng, location_name, hazard_type, severity, confidence_pct, description, image_url, reporter_role, is_verified, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        report_data["lat"],
        report_data["lng"],
        report_data.get("location_name", "NER Field Station"),
        report_data.get("hazard_type", "TENSION_CRACK"),
        report_data.get("severity", "HIGH"),
        report_data.get("confidence_pct", 90.0),
        report_data.get("description", ""),
        report_data.get("image_url", ""),
        report_data.get("reporter_role", "Citizen / Field Worker"),
        1 if report_data.get("is_verified", True) else 0,
        report_data.get("status", "VERIFIED"),
        time.time()
    ))
    report_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return report_id

def get_all_reports() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM field_reports ORDER BY created_at DESC")
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results

def add_dispatch(dispatch_data: Dict[str, Any]) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO emergency_dispatches
    (report_id, team_name, target_location, priority, assigned_route, status, dispatched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        dispatch_data.get("report_id", 0),
        dispatch_data.get("team_name", "SDRF Rapid Response Team 1"),
        dispatch_data.get("target_location", "Hazard Zone"),
        dispatch_data.get("priority", "CRITICAL"),
        dispatch_data.get("assigned_route", "Safe Mountain Bypass"),
        "DEPLOYED",
        time.time()
    ))
    dispatch_id = cursor.lastrowid

    # Update report status
    if dispatch_data.get("report_id"):
        cursor.execute("UPDATE field_reports SET status = 'ACTION_DISPATCHED' WHERE id = ?", (dispatch_data["report_id"],))

    conn.commit()
    conn.close()
    return dispatch_id

def get_all_dispatches() -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM emergency_dispatches ORDER BY dispatched_at DESC")
    rows = cursor.fetchall()
    results = [dict(row) for row in rows]
    conn.close()
    return results
