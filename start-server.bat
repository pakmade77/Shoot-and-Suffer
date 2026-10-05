@echo off
title Shoot & Suffer Game Server
cd /d "%~dp0"

echo ========================================================
echo   🏀 SHOOT ^& SUFFER - GAME SERVER LAUNCHER
echo ========================================================
echo.

echo Starting Game Server on 0.0.0.0:3000...
echo.
echo ========================================================
echo   📱 Game is Ready:
echo   - Local PC  : http://localhost:3000
echo ========================================================
echo.
echo Server is LIVE! Keep this window open while playing.
echo.

npm run start
pause

