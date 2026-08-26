@echo off
title Shoot & Suffer Game Server
cd /d "%~dp0"

echo ========================================================
echo   🏀 SHOOT ^& SUFFER - LAN GAME SERVER LAUNCHER
echo ========================================================
echo.

:: 1. Check and Start MySQL if not already running
netstat -ano | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo [1/2] Starting MySQL Database (XAMPP)...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "" /b "C:\xampp\mysql\bin\mysqld.exe" --console
    )
    timeout /t 3 /nobreak >nul
) else (
    echo [1/2] MySQL Database is already active (Port 3306).
)

:: 2. Start Next.js Production Server
echo [2/2] Starting Game Server on 0.0.0.0:3000...
echo.
echo ========================================================
echo   📱 Game is Ready on Your Network:
echo   - Local PC  : http://localhost:3000
echo   - LAN / HP  : http://192.168.11.46:3000
echo ========================================================
echo.
echo Server is LIVE! Keep this window open while playing.
echo.

npm run start
pause
