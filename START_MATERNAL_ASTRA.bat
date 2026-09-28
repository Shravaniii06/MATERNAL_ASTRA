@echo off
title MATERNAL_ASTRA Launcher

echo.
echo ==========================================
echo       STARTING MATERNAL_ASTRA
echo ==========================================
echo.

REM =========================
REM START BACKEND
REM =========================
echo Starting Backend...

start "MATERNAL_ASTRA Backend" cmd.exe /k "cd /d "%~dp0Backend" && python main.py"

REM Wait for backend
timeout /t 5 /nobreak > nul


REM =========================
REM START REACT FRONTEND
REM =========================
echo Starting React Frontend...

start "MATERNAL_ASTRA Frontend" cmd.exe /k "cd /d "%~dp0Frontend" && npm start"

REM Wait for React
timeout /t 8 /nobreak > nul


REM =========================
REM OPEN BROWSER
REM =========================
echo Opening MATERNAL_ASTRA...

start "" http://127.0.0.1:3000

echo.
echo ==========================================
echo   MATERNAL_ASTRA STARTED
echo ==========================================
echo.
pause