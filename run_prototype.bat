@echo off
title NER Landslide Guard AI - Launcher
echo ======================================================================
echo       NER LANDSLIDE GUARD AI - EARLY WARNING & MONITORING SYSTEM
echo                     Smart India Hackathon (SIH)
echo ======================================================================
echo.
echo [1/2] Starting Python FastAPI Backend on http://localhost:8000 ...
start "NER Landslide Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React + Vite Frontend Dashboard on http://localhost:5173 ...
start "NER Landslide Frontend (React)" cmd /k "cd frontend && npm run dev"

echo.
echo ======================================================================
echo  System Initialized! 
echo  - Frontend Dashboard: http://localhost:5173
echo  - Backend API Docs:   http://localhost:8000/docs
echo ======================================================================
pause
