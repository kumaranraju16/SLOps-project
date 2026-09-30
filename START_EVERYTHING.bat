@echo off
title SLOps Master Launcher
echo =========================================================
echo       🚀 Starting SLOps (AI IT Operations Assistant)
echo =========================================================
echo.
echo 1. Starting Backend (FastAPI + Groq + LangGraph)...
start "SLOps Backend (:8000)" cmd /k "cd /d e:\Projects\FYP\slops backend && .\.venv\Scripts\python.exe run_server.py"

echo 2. Starting Frontend (React + Vite)...
start "SLOps Frontend (:5173)" cmd /k "cd /d e:\Projects\FYP\slops frontend && npm run dev"

echo.
echo Waiting for backend to finish loading AI models and database...
powershell -Command "
$count = 0
while ($count -lt 30) {
    try {
        $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/conversations' -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { break }
    } catch {}
    Start-Sleep -Seconds 1
    $count++
    Write-Host '.' -NoNewline
}
Write-Host ''
"

echo 3. Backend is READY! Opening browser...
start http://localhost:5173

echo.
echo =========================================================
echo   All systems running! Keep both command windows open.
echo   To stop, simply run STOP_EVERYTHING.bat or close windows.
echo =========================================================
pause
