# 🏔️ NER Landslide Guard AI
### AI-Based Early Warning and Landslide Risk Monitoring System for the North Eastern Region (NER)
**Smart India Hackathon (SIH) Prototype**

---

## 📌 Executive Summary
The North Eastern Region (NER) of India suffers catastrophic economic disruption, loss of life, and isolation of remote mountain communities every monsoon due to landslides along critical arteries like **NH-10 (Sikkim Lifeline)**, **NH-29 (Nagaland Corridor)**, and **NH-6 (Meghalaya-Barak Link)**.

**NER Landslide Guard AI** shifts disaster management from **reactive post-disaster cleanup** to **proactive real-time early warning & intelligent evacuation logistics**.

---

## 🚀 Key Features & Innovations

1. **Two-Tier AI/ML Early Warning Engine**:
   - **Static Landslide Susceptibility Index (LSI)**: Evaluates slope angle (DEM CartoSat), lithology/phyllite factor, and fault line proximity.
   - **Dynamic Hydrological Trigger Model**: Computes Antecedent Rainfall Index ($ARI$) and soil pore saturation with empirical $I\text{--}D$ failure curves.
2. **Interactive 2D/3D GIS Command Map**:
   - Topographic, Satellite, and Street layer switching with live hazard buffers, historical hotspots, and vulnerable road corridors.
3. **Crowdsourced Field Reporting with Edge AI Vision**:
   - On-device computer vision inspection for road tension cracks, mudflows, and retaining wall bulges with instant confidence scoring ($96\%+$).
4. **Safe Evacuation & Emergency Logistics Optimizer**:
   - Dynamic pathfinder that detects blocked mountain chokepoints and reroutes ambulances, food rations, and SDRF convoys through cleared bypasses.
5. **Multilingual Early Warning & Siren Center**:
   - Generates alerts in **8 regional dialects**: Assamese, Bengali, Manipuri (Meitei), Mizo, Khasi, Garo, Hindi, and English.
   - Browser Web Speech Audio TTS + Physical Siren Frequency Synthesizer.
6. **Offline & 2G GSM SMS Resiliency**:
   - Local IndexedDB/SQLite queuing with auto-sync, plus a compressed 2G SMS decoder for zero-internet mountain zones (`#SLIDE <LAT> <LNG> <SEV> <NOTES>`).

---

## 🛠️ Tech Stack

- **Backend**: Python 3.13, FastAPI, Pydantic, NumPy, Pillow, SQLite3, Requests, Uvicorn
- **Frontend**: React 18, Vite, TailwindCSS, Leaflet GIS, Lucide Icons, Web Speech & Web Audio APIs
- **Remote Sensing & Weather**: Open-Meteo REST API, SRTM/CartoDEM 30m terrain heuristics

---

## ⚡ Quick Start (Running the Prototype)

### Option 1: One-Click Launcher (Windows)
Double-click `run_prototype.bat` or run in PowerShell:
```powershell
.\run_prototype.ps1
```

### Option 2: Manual Terminal Execution

#### 1. Backend Server (FastAPI):
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Open Swagger API Docs at: **http://localhost:8000/docs**

#### 2. Frontend Dashboard (React + Vite):
```bash
cd frontend
npm run dev
```
- Open GIS Dashboard in your browser at: **http://localhost:5173**

---

## 🎤 3-Minute Demo Script for SIH Judges

1. **Minute 1: The Problem & The GIS Map**
   - Open `http://localhost:5173`.
   - Show the interactive map of the 8 North Eastern states with red-alert risk zones and highway corridors (NH-10, NH-29).
   - Switch between **Topographic**, **Street**, and **Satellite** views.
2. **Minute 2: The Two-Tier ML Engine & Field AI**
   - Click on East Sikkim or Kohima.
   - Move the **24h Rainfall Intensity** and **Soil Pore Saturation** sliders to demonstrate how the ML model updates the landslide failure probability in real-time.
   - Click **"Field Report (AI Vision)"** $\rightarrow$ select a photo preset $\rightarrow$ show how on-device AI detects asphalt tension cracks and verifies the report before sending.
3. **Minute 3: Safe Routing & Multilingual Voice Broadcast**
   - Switch to **Safe Evacuation Routes** tab: show how the primary NH-10 route is marked blocked, and the algorithm automatically paths convoys through the safe Lava/Pedong bypass.
   - Switch to **Multilingual Siren Hub**: switch language to *Assamese* or *Mizo* and click **"Play Voice Alert (TTS)"** and **"Test Village Siren"** to demonstrate audible last-mile warnings.
   - Switch to **2G GSM Terminal**: type a short SMS code to prove the system works even when mountain cell towers lose 4G data.
