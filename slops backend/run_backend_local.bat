@echo off
echo ===================================================
echo   Starting SLOps Backend locally from E: drive
echo ===================================================
cd /d "e:\Projects\FYP\slops backend"

echo Starting FastAPI server on port 8000...
echo Swagger UI docs available at: http://localhost:8000/docs
echo.
.\.venv\Scripts\python.exe run_server.py
pause
