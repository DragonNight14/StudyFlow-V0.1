@echo off
setlocal enabledelayedexpansion

echo 🔍 Assignment Tracker - Debug and Build Script
echo ===============================================

REM Check system requirements
echo 📋 Checking system requirements...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed
    echo 💡 Solution: Download and install Node.js from https://nodejs.org/
    goto :error_exit
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js !NODE_VERSION! detected
)

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed
    goto :error_exit
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo ✅ npm !NPM_VERSION! detected
)

REM Check project files
echo.
echo 📁 Checking project files...

if not exist "index.html" (
    echo ❌ index.html is missing
    goto :error_exit
) else (
    echo ✅ index.html found
)

if not exist "manifest.json" (
    echo ❌ manifest.json is missing
    goto :error_exit
) else (
    echo ✅ manifest.json found
)

if not exist "sw.js" (
    echo ❌ sw.js (service worker) is missing
    goto :error_exit
) else (
    echo ✅ sw.js found
)

REM Check icon files
echo.
echo 🎨 Checking icon files...

if not exist "icon-192x192.png" (
    echo ⚠️  icon-192x192.png is missing
    set MISSING_ICONS=1
) else (
    echo ✅ icon-192x192.png found
)

if not exist "icon-512x512.png" (
    echo ⚠️  icon-512x512.png is missing
    set MISSING_ICONS=1
) else (
    echo ✅ icon-512x512.png found
)

if defined MISSING_ICONS (
    echo.
    echo 🎨 Generating missing icons...
    start create-icons.html
    echo Please generate and download the icon files, then run this script again.
    pause
    exit /b 1
)

REM Validate manifest.json
echo.
echo 🔍 Validating manifest.json...
node -e "
const fs = require('fs');
try {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    console.log('✅ manifest.json is valid JSON');
    
    const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missing = required.filter(field => !manifest[field]);
    
    if (missing.length > 0) {
        console.log('❌ Missing required fields:', missing.join(', '));
        process.exit(1);
    } else {
        console.log('✅ All required fields present');
    }
    
    if (!manifest.icons || manifest.icons.length === 0) {
        console.log('❌ No icons defined');
        process.exit(1);
    } else {
        console.log('✅ Icons defined');
    }
} catch (e) {
    console.log('❌ manifest.json is invalid:', e.message);
    process.exit(1);
}
"

if errorlevel 1 (
    echo ❌ manifest.json validation failed
    goto :error_exit
)

REM Check for common issues in HTML files
echo.
echo 🔍 Checking HTML files for common issues...

REM Check for viewport meta tag
findstr /C:"viewport" index.html >nul
if errorlevel 1 (
    echo ⚠️  Missing viewport meta tag in index.html
    echo 💡 Add: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
) else (
    echo ✅ Viewport meta tag found
)

REM Check for manifest link
findstr /C:"manifest" index.html >nul
if errorlevel 1 (
    echo ❌ Missing manifest link in index.html
    echo 💡 Add: <link rel=\"manifest\" href=\"./manifest.json\">
    goto :error_exit
) else (
    echo ✅ Manifest link found
)

REM Check for service worker registration
findstr /C:"serviceWorker" index.html >nul
if errorlevel 1 (
    echo ⚠️  Service worker registration not found in index.html
    echo 💡 Add service worker registration script
) else (
    echo ✅ Service worker registration found
)

REM Check Android SDK
echo.
echo 🤖 Checking Android development environment...

if "%ANDROID_HOME%"=="" (
    echo ⚠️  ANDROID_HOME environment variable is not set
    echo 💡 This is required for local APK building
    echo 💡 Alternative: Use PWA Builder cloud service
    set USE_PWA_BUILDER=1
) else (
    echo ✅ ANDROID_HOME set to: %ANDROID_HOME%
    
    if exist "%ANDROID_HOME%\build-tools" (
        echo ✅ Android build tools found
    ) else (
        echo ⚠️  Android build tools not found
        echo 💡 Install Android Studio and build tools
    )
)

REM Install dependencies
echo.
echo 📦 Installing dependencies...
npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    goto :error_exit
)

echo ✅ Dependencies installed

REM Start local server for testing
echo.
echo 🌐 Starting local server for testing...
start /b npx http-server -p 8080 -c-1

echo ⏳ Waiting for server to start...
timeout /t 3 /nobreak >nul

echo ✅ Server started at http://localhost:8080

REM Test PWA
echo.
echo 🧪 Testing PWA functionality...

REM Check if service worker is registered
echo 📱 Testing service worker...
start http://localhost:8080

echo.
echo 🎯 PWA Testing Checklist:
echo 1. Open http://localhost:8080 in Chrome
echo 2. Open DevTools (F12)
echo 3. Go to Application tab
echo 4. Check Service Workers section
echo 5. Verify manifest is loaded
echo 6. Test "Install" prompt (if available)
echo 7. Test offline functionality

REM Build options
echo.
echo 🔨 Build Options:
echo 1. Build APK locally (requires Android SDK)
echo 2. Use PWA Builder cloud service
echo 3. Test PWA only
echo.

if defined USE_PWA_BUILDER (
    echo 💡 Since ANDROID_HOME is not set, PWA Builder is recommended
    set /p choice="Choose option (2/3): "
) else (
    set /p choice="Choose option (1/2/3): "
)

if "!choice!"=="1" (
    if defined USE_PWA_BUILDER (
        echo ❌ Cannot build locally without Android SDK
        goto :error_exit
    )
    echo 🔨 Building APK locally...
    call build-apk.bat
) else if "!choice!"=="2" (
    echo 🌐 Using PWA Builder cloud service...
    echo 📋 Please visit: https://www.pwabuilder.com/android
    echo 📋 Enter your app URL: http://localhost:8080
    echo 📋 Follow the instructions to download your APK
    start https://www.pwabuilder.com/android
) else if "!choice!"=="3" (
    echo 🧪 Testing PWA only...
    echo ✅ PWA is ready for testing at http://localhost:8080
) else (
    echo ❌ Invalid choice
    goto :error_exit
)

echo.
echo ✅ Debug and build process completed!
echo 📱 Your Assignment Tracker PWA is ready for Android deployment

:end
echo.
echo 📋 Next Steps:
echo 1. Test the PWA thoroughly
echo 2. Build the APK using your chosen method
echo 3. Install on Android device
echo 4. Test all functionality on device
echo.
pause
exit /b 0

:error_exit
echo.
echo ❌ Debug process failed. Please fix the issues above and try again.
echo.
pause
exit /b 1


