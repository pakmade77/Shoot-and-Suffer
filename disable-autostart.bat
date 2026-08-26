@echo off
echo ========================================================
echo   🏀 SHOOT ^& SUFFER - DISABLE AUTOSTART ON WINDOWS BOOT
echo ========================================================
echo.

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\ShootAndSufferGame.lnk"

if exist "%SHORTCUT_PATH%" (
    del "%SHORTCUT_PATH%"
    echo [OK] Auto-start removed from Windows Startup.
) else (
    echo [INFO] Auto-start was not enabled.
)
echo.
pause
