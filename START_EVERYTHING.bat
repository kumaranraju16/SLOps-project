@echo off
title SLOps Master Launcher
echo =========================================================
echo       🚀 Starting SLOps (AI IT Operations Assistant)
echo =========================================================
echo.
echo 1. Starting Backend (FastAPI + Groq + LangGraph)...
start "SLOps Backend (:8000)" cmd /k "cd /d e:\Projects\FYP\slops backend && .\.venv\Scripts\python.exe run_server.py"

timeout /t 3 /nobreak >nul

echo 2. Starting Frontend (React + Vite)...
start "SLOps Frontend (:5173)" cmd /k "cd /d e:\Projects\FYP\slops frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo 3. Opening Browser...
start http://localhost:5173

echo.
echo =========================================================
echo   All systems running! Keep both command windows open.
echo   To stop, simply close the two command prompt windows.
echo =========================================================
pause
