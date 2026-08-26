@echo off
echo ========================================================
echo   🏀 Shoot ^& Suffer - Windows Firewall Configuration
echo ========================================================
echo.
echo Allowing inbound traffic on Port 3000 (Next.js) and 3306 (MySQL)...
echo (Please run as Administrator if prompted)
echo.
netsh advfirewall firewall delete rule name="ShootGame Next.js Server (Port 3000)" >nul 2>&1
netsh advfirewall firewall add rule name="ShootGame Next.js Server (Port 3000)" dir=in action=allow protocol=TCP localport=3000

netsh advfirewall firewall delete rule name="ShootGame MySQL Database (Port 3306)" >nul 2>&1
netsh advfirewall firewall add rule name="ShootGame MySQL Database (Port 3306)" dir=in action=allow protocol=TCP localport=3306

echo.
echo ✅ Firewall rules successfully added!
echo Devices on your office Wi-Fi / LAN can now connect to:
echo   http://192.168.11.46:3000
echo   http://192.168.100.2:3000
echo.
pause
