@echo off
title Stop SLOps Servers
echo =========================================================
echo       🛑 Stopping SLOps Servers (Port 8000 & 5173)
echo =========================================================
echo.
echo Stopping python/uvicorn on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping node/vite on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo =========================================================
echo   Done! All servers stopped cleanly.
echo =========================================================
pause
