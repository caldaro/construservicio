@echo off
setlocal
set "PORT=8080"
for /f "delims=" %%I in ('powershell -NoProfile -Command "$ip = Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -like '192.168.*' -and $_.PrefixOrigin -ne 'WellKnown' } ^| Select-Object -First 1 -ExpandProperty IPAddress; if ($ip) { $ip }"') do set "LAN_IP=%%I"
if not defined LAN_IP set "LAN_IP=192.168.40.210"
echo ConstruServicio OS - servidor local
echo URL para este computador: http://localhost:%PORT%
echo URL para Chrome Android en la misma red: http://%LAN_IP%:%PORT%
echo Presione Ctrl+C para detener el servidor.
python -m http.server %PORT% --directory public --bind 0.0.0.0
endlocal
