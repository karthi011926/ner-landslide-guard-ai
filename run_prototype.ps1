# PowerShell Launcher for NER Landslide Guard AI
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "      NER LANDSLIDE GUARD AI - EARLY WARNING & MONITORING SYSTEM      " -ForegroundColor Green
Write-Host "                    Smart India Hackathon (SIH)                       " -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "[1/2] Launching Python FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

# Start Frontend
Write-Host "[2/2] Launching React Vite Dashboard on http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host ""
Write-Host "System Launch Completed!" -ForegroundColor Green
Write-Host "Open Browser at: http://localhost:5173" -ForegroundColor White
Write-Host "API Swagger Docs: http://localhost:8000/docs" -ForegroundColor White
