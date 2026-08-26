@echo off
echo ========================================================
echo   🏀 Starting Shoot ^& Suffer MySQL Container
echo ========================================================
echo.
docker compose up -d db
echo.
echo Waiting for MySQL container to become healthy...
timeout /t 5 /nobreak >nul
echo.
echo Syncing database schema...
call npx prisma db push
echo.
echo ✅ MySQL Container is ready on port 3306!
echo.
pause
