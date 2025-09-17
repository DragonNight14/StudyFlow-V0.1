@echo off
echo ========================================
echo    Installing Missing Dependencies
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    echo Then restart this script.
    pause
    exit /b 1
)

echo.
echo [1/5] Installing basic dependencies...
call npm install

echo.
echo [2/5] Installing Capacitor CLI globally...
call npm install -g @capacitor/cli

echo.
echo [3/5] Installing Capacitor core and Android...
call npm install @capacitor/core @capacitor/android

echo.
echo [4/5] Installing TypeScript (required for config)...
call npm install -D typescript

echo.
echo [5/5] Verifying installation...
call npx cap --version

echo.
echo ========================================
echo Dependencies installed successfully!
echo ========================================
echo.
echo Now run: fix-android-studio.bat
echo.
pause
