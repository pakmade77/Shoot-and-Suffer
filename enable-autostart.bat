@echo off
cd /d "%~dp0"
echo ========================================================
echo   🏀 SHOOT ^& SUFFER - ENABLE AUTOSTART ON WINDOWS BOOT
echo ========================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "VBS_PATH=%SCRIPT_DIR%run-in-background.vbs"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_FOLDER%\ShootAndSufferGame.lnk"

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%SHORTCUT_PATH%'); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%VBS_PATH%\"'; $s.WorkingDirectory = '%SCRIPT_DIR%'; $s.Save()"

echo [OK] Auto-start successfully enabled!
echo When your computer restarts, the game server will start automatically in the background.
echo.
echo URL: http://192.168.11.46:3000
echo.
pause
