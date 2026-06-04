@echo off
title Scouts Kriko-M Website
cd /d "%~dp0"

REM Controleer of PHP beschikbaar is
where php >nul 2>nul
if errorlevel 1 (
    echo.
    echo [FOUT] PHP is niet gevonden op deze computer.
    echo Installeer PHP ^(bijv. via XAMPP of php.net^) en zorg dat het in PATH staat.
    echo.
    pause
    exit /b 1
)

set PORT=8000

echo.
echo ============================================
echo   Scouts Kriko-M website wordt gestart...
echo   Adres: http://localhost:%PORT%
echo ============================================
echo.
echo Sluit dit venster om de website te stoppen.
echo.

REM Open de browser na een korte vertraging
start "" http://localhost:%PORT%

REM Start de ingebouwde PHP-webserver (blijft draaien in dit venster)
php -S localhost:%PORT%
