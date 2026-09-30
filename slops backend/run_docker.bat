@echo off
set "PATH=%PATH%;C:\Users\LENOVO\AppData\Local\Programs\DockerDesktop\resources\bin"
echo ===================================================
echo   Starting SLOps Backend with Docker Compose
echo ===================================================
cd /d "e:\Projects\FYP\slops backend"
docker compose up -d --build
echo.
echo Containers status:
docker compose ps
echo.
echo FastAPI is running at: http://localhost:8000
echo API Documentation at:  http://localhost:8000/docs
echo.
pause
