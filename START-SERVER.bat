@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
title DAISHA MANAGEMENT SYSTEM - SERVER LAUNCHER
color 0A
cls

echo =====================================================================
echo           PT BRIDGESTONE TIRE INDONESIA - DAISHA SYSTEM
echo           Server Local Internal Workshop dan Maintenance
echo =====================================================================
echo.

:: 1. Cek Instalasi Node.js
where node >nul 2>nul
if errorlevel 1 (
    color 0C
    echo [ERROR] Node.js belum terinstall di PC ini!
    echo Silakan download dan install Node.js LTS terlebih dahulu dari:
    echo https://nodejs.org/
    echo.
    pause
    exit /b
)

echo [1/3] Node.js terdeteksi:
node -v
echo.

:: 2. Cek dependensi node_modules
if not exist "node_modules\" (
    echo [2/3] Menginstall dependensi proyek pertama kali...
    call npm.cmd install
    if errorlevel 1 (
        color 0C
        echo [ERROR] Gagal menginstall dependensi! Periksa koneksi internet Anda.
        pause
        exit /b
    )
) else (
    echo [2/3] Dependensi proyek sudah siap.
)

:: 3. Sinkronisasi Database Prisma SQLite
echo [3/3] Menyiapkan database SQLite internal...
if not exist "prisma\dev.db" (
    echo Menyiapkan struktur tabel database pertama kali...
    if exist "node_modules\.bin\prisma.cmd" (
        call node_modules\.bin\prisma.cmd db push --skip-generate >nul 2>nul
    ) else (
        call npx.cmd prisma db push --skip-generate >nul 2>nul
    )
)
if exist "node_modules\.bin\prisma.cmd" (
    call node_modules\.bin\prisma.cmd generate >nul 2>nul
) else (
    call npx.cmd prisma generate >nul 2>nul
)
echo Database siap.
echo.

:: 4. Dapatkan IP Address Lokal PC
set LOCAL_IP=localhost
for /f "tokens=*" %%a in ('node scripts/get-ip.cjs') do (
    set LOCAL_IP=%%a
)

set APP_PORT=3000

cls
echo =====================================================================
echo           PT BRIDGESTONE TIRE INDONESIA - DAISHA SYSTEM
echo                     SERVER INTERNAL WORKSHOP
echo =====================================================================
echo.
echo IP Server  : %LOCAL_IP%
echo Port       : %APP_PORT%
echo.
echo Akses dari perangkat lain di jaringan Wi-Fi / LAN yang SAMA:
echo.
echo    [PC Server Ini] : http://localhost:%APP_PORT%
echo    [HP / Tab Lain] : http://%LOCAL_IP%:%APP_PORT%
echo.
echo Akun Login:
echo    - Admin    : admin / admin123
echo    - Operator : operator / operator123
echo.
echo Tekan Ctrl+C untuk menghentikan server.
echo =====================================================================
echo.
call npm.cmd run dev
pause
