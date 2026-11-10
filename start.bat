@echo off
echo Starting Museum Curator Chatbot on http://localhost:3000 ...
cd /d "%~dp0"
call npm.cmd run dev
pause
