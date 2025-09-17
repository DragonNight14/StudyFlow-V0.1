# 📱 Assignment Tracker - Unified Project

This is the complete unified version of the HW Tracker that combines both the PWA functionality and APK build capabilities into one project.

## 🚀 Quick Start Options

### Option 1: Run as PWA (Web App)
```bash
npm start
# Opens at http://localhost:8080
```

### Option 2: Build Android APK (Recommended)
```bash
# Quick automated build
build-apk-simple.bat
```

### Option 3: Manual APK Build
```bash
# Install all dependencies
install-dependencies.bat

# Then build APK
npm run build-apk
```

## 📋 Prerequisites

1. **Node.js** (v16+) - [Download here](https://nodejs.org/)
2. **Android Studio** (for APK builds) - [Download here](https://developer.android.com/studio)
3. **Java JDK 11+** - Usually comes with Android Studio

## 🔧 Build Scripts Available

- `build-apk-simple.bat` - Automated APK build (recommended)
- `install-dependencies.bat` - Install all required dependencies
- `fix-android-studio.bat` - Fix Android Studio launch issues
- `simple-apk-build.bat` - Alternative Cordova-based build
- `debug-and-build.bat` - Debug and build tools
- `quick-apk.bat` - Quick APK generation

## 📁 Project Structure

### Core Files
- `index.html` - Main app entry point
- `script.js` - Main application logic
- `enhanced-script.js` - Enhanced features and premium functionality
- `styles.css` - Main styling
- `settings.css` - Settings page styling
- `animations.css` - UI animations

### Configuration Files
- `package.json` - Node.js dependencies and scripts
- `manifest.json` - PWA manifest
- `capacitor.config.ts` - Capacitor configuration for APK builds
- `android-config.json` - Android build settings

### Icons & Assets
- `icon-192x192.png` - PWA icon (192x192)
- `icon-512x512.png` - PWA icon (512x512) - **Required for APK builds**

### Premium Features
- `paid-features/` - Premium functionality modules
- `enhanced-settings.js` - Advanced settings management
- `background-manager.js` - Background task management

## ✨ Features Included

- ✅ **Glassmorphic UI Design** - Modern, beautiful interface
- ✅ **Assignment Tracking** - Complete homework management system
- ✅ **Canvas LMS Integration** - Sync with Canvas courses
- ✅ **Google Classroom Integration** - Import assignments automatically
- ✅ **Premium Features** - Advanced analytics, cloud sync, themes
- ✅ **Developer Panel** - Hidden admin features (Konami code access)
- ✅ **PWA Capabilities** - Install as native app on any device
- ✅ **Dark Mode Support** - Toggle between light/dark themes
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Android APK Build** - Generate native Android app

## 🔐 Developer Access

**Desktop:** Konami code sequence (↑↑↓↓←→←→BA)
**Mobile:** Triple-tap app title, enter password: `konami`

## 📱 APK Build Details

- **App Name:** Assignment Tracker
- **Package ID:** com.assignmenttracker.app
- **Version:** 1.0.0
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** 33 (Android 13)

## 🛠️ Troubleshooting

### PWA Issues
- Clear browser cache and reload
- Check console for JavaScript errors
- Ensure all files are served over HTTPS for full PWA features

### APK Build Issues
- **Missing icons error:** Run `create-pwa-icon.html` to generate required icons
- **Gradle sync fails:** Update Android Studio, check internet connection
- **Build errors:** Clean project in Android Studio (Build > Clean Project)
- **APK won't install:** Enable "Unknown sources" in Android settings

### Common Fixes
1. **Dependencies missing:** Run `install-dependencies.bat`
2. **Android Studio won't open:** Run `fix-android-studio.bat`
3. **Build fails:** Try `simple-apk-build.bat` for Cordova alternative

## 🎯 Usage Instructions

### For Students
1. Open the app (web or APK)
2. Connect Canvas/Google Classroom accounts
3. Import assignments automatically
4. Track progress and set reminders
5. Use premium features for advanced analytics

### For Developers
1. Access developer panel with Konami code
2. Enable debug mode for detailed logging
3. Test premium features without payment
4. Access build and deployment tools

## 📞 Support & Documentation

- Main documentation: `README.md`
- APK build guide: `APK-BUILD-GUIDE.md`
- Build simulation: `build-simulation.txt`

## 🔄 Project Consolidation

This unified project combines:
- **HW Tracker v1.0** - Core PWA functionality
- **HW Tracker APK Build** - Android build capabilities

All features from both projects are now available in this single, unified codebase. Nothing has been lost in the consolidation process.

---

**Ready to use!** Choose your preferred method above and start tracking assignments! 🎓
