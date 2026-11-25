@echo off
setlocal
set "PORT=8080"
for /f "delims=" %%I in ('powershell -NoProfile -Command "$ip = Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -like '192.168.*' -and $_.PrefixOrigin -ne 'WellKnown' } ^| Select-Object -First 1 -ExpandProperty IPAddress; if ($ip) { $ip }"') do set "LAN_IP=%%I"
if not defined LAN_IP set "LAN_IP=192.168.40.210"
echo ConstruServicio OS - servidor local
echo PWA modular: http://localhost:%PORT%/public/
echo AppCreator24: http://localhost:%PORT%/appcreator24/index.html
echo PWA para Chrome Android: http://%LAN_IP%:%PORT%/public/
echo AppCreator24 para Chrome Android: http://%LAN_IP%:%PORT%/appcreator24/index.html
echo Presione Ctrl+C para detener el servidor.
python -m http.server %PORT% --directory . --bind 0.0.0.0
endlocal
