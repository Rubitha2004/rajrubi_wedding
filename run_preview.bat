@echo off
title Rajkumar & Rubitha Wedding Invitation Preview
cd /d "%~dp0"

echo ========================================================
echo   Rajkumar & Rubitha Wedding Invitation Local Preview
echo ========================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting preview server using Python...
    python preview.py
    goto end
)

where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Starting preview server using Python Launcher (py)...
    py preview.py
    goto end
)

where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Python not found. Starting preview server using npx serve...
    npx -y serve -p 8000 .
    goto end
)

echo ERROR: Neither Python nor Node.js was found in PATH.
echo To run the site locally without browser CORS restrictions:
echo 1. Install Python from https://www.python.org/ or Node.js from https://nodejs.org/
echo 2. Or upload the project folder to GitHub Pages, Firebase Hosting, or any web server.
echo.
pause

:end
