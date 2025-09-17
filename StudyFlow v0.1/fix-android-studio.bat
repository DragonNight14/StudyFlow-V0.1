@echo off
echo ========================================
echo    Android Studio Manual Launch Fix
echo ========================================
echo.

echo [1/4] Re-initializing Capacitor...
call npx cap init "Assignment Tracker" "com.assignmenttracker.app" --web-dir="."

echo.
echo [2/4] Adding Android platform...
call npx cap add android

echo.
echo [3/4] Syncing project...
call npx cap sync

echo.
echo [4/4] Opening Android Studio...
call npx cap open android

echo.
echo If Android Studio still doesn't open:
echo 1. Open Android Studio manually
echo 2. Click "Open an Existing Project"
echo 3. Navigate to: %CD%\android
echo 4. Click OK
echo.
pause
