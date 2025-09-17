@echo off
echo ========================================
echo    Simple APK Build - No Dependencies
echo ========================================
echo.

echo This method uses Cordova instead of Capacitor
echo (easier setup, fewer dependencies)
echo.

echo [1/4] Installing Cordova globally...
call npm install -g cordova

echo.
echo [2/4] Creating Cordova project...
call cordova create cordova-build com.assignmenttracker.app "Assignment Tracker"

echo.
echo [3/4] Copying web files...
xcopy /E /Y *.html cordova-build\www\
xcopy /E /Y *.css cordova-build\www\
xcopy /E /Y *.js cordova-build\www\
xcopy /E /Y *.json cordova-build\www\
xcopy /E /Y *.png cordova-build\www\
xcopy /E /Y paid-features cordova-build\www\paid-features\

echo.
echo [4/4] Adding Android platform...
cd cordova-build
call cordova platform add android

echo.
echo ========================================
echo BUILD READY!
echo ========================================
echo.
echo Next steps:
echo 1. cd cordova-build
echo 2. cordova build android
echo 3. Your APK will be in: platforms\android\app\build\outputs\apk\
echo.
echo OR install Android Studio and run:
echo cordova run android
echo.
pause
