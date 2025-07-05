@echo off
echo Starting OpenAI Chat Server...
echo.
cd /d "%~dp0"
node server.js
pause
