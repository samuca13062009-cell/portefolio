@echo off
cd /d "%~dp0"
rem Abre o backoffice no browser so quando o servidor ja responde (antes abria cedo demais e dava erro).
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for ($i = 0; $i -lt 60; $i++) { try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://127.0.0.1:4180/admin | Out-Null; Start-Process http://localhost:4180/admin; break } catch { Start-Sleep -Milliseconds 500 } }"
node server.js
pause
