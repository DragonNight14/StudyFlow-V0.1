@echo off
echo ========================================
echo    Assignment Tracker APK Builder
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Installing dependencies...
call npm install

echo.
echo [2/6] Installing Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/android

echo.
echo [3/6] Initializing Capacitor...
call npx cap init "Assignment Tracker" "com.assignmenttracker.app"

echo.
echo [4/6] Adding Android platform...
call npx cap add android

echo.
echo [5/6] Copying web assets...
call npx cap copy

echo.
echo [6/6] Opening Android Studio...
call npx cap open android

echo.
echo ========================================
echo APK BUILD COMPLETE!
echo ========================================
echo.
echo Next steps in Android Studio:
echo 1. Wait for Gradle sync to complete
echo 2. Go to Build ^> Generate Signed Bundle/APK
echo 3. Choose APK and follow the signing wizard
echo 4. Your APK will be in: android/app/build/outputs/apk/
echo.
pause
