# 📚 Homework Tracker - Glassmorphic PWA

A modern, glassmorphic Progressive Web App for tracking academic assignments with real-time Canvas LMS and Google Classroom integration, featuring offline-first functionality and premium features.

## ✨ Features

### 🎨 Modern Glassmorphic Design
- Translucent cards with blur effects
- Smooth 60fps animations
- Dynamic priority sections (High Priority, Coming Up, Worry About It Later)
- Customizable assignment cards with color streaks
- Dark mode with tinted black styling

### 📅 Smart Assignment Management
- Dynamic priority categorization based on due dates
- Customizable assignment cards with gradients, colors, and images
- Calendar view with tap-and-hold pip markers
- Assignment editing functionality
- Completion celebrations with fade-out animations

### 🔗 Real-time API Integration
- Canvas LMS direct integration (no manual API keys)
- Google Classroom OAuth integration
- Real-time sync with error handling
- Offline-first with background sync
- Assignment merging and conflict resolution

### 🎯 Premium Features
- Advanced Analytics with productivity reports
- Cloud Sync for cross-device backup
- Premium Themes with special effects
- Upgrade prompts and feature gating

### 📱 PWA & Offline Support
- Service worker caching
- IndexedDB storage
- Push notifications for deadlines
- Background sync queue
- Installable on mobile and desktop

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome/Edge recommended)
- Internet connection for API integrations
- Optional: Node.js for development

### Installation
1. Clone or download this project
2. Open `index.html` in your browser
3. Or serve via local server for full PWA features
4. Install as PWA using browser's "Add to Home Screen"

## 🎨 Customization

### Theme & Colors
- **Color Palettes**: Ocean, Sunset, Forest, Lavender, Rose Gold, Monochrome
- **Custom Colors**: Primary, secondary, and accent color pickers
- **Background Options**: Gradient, patterns (dots, grid, waves, hexagon), custom images, solid colors
- **Dark Mode**: Tinted black styling with glassmorphic elements

### Assignment Cards
- **Color Streaks**: Visual indicators for Canvas LMS (blue) and Google Classroom (green)
- **Custom Backgrounds**: Gradients, solid colors, and uploaded images
- **Priority Levels**: High (red), Medium (yellow), Low (green) with visual indicators
- **Editable**: Modify title, description, due date, colors, and priority

### Settings & Preferences
- **Notifications**: Push notifications, deadline reminders, completion celebrations
- **API Integration**: Toggle Canvas and Google Classroom sync
- **Data Management**: Export, import, and clear data options
- **Shader Effects**: Toggle glassmorphic blur effects

## 📱 Mobile & PWA Features

### Installation
1. Open the app in Chrome/Edge on mobile
2. Tap the "Add to Home Screen" prompt
3. Or use browser menu > "Install App"
4. App will appear as native app icon

### Offline Functionality
- All assignments cached locally
- Create and edit assignments offline
- Background sync when connection restored
- Service worker handles caching strategies

### Push Notifications
- Assignment deadline reminders
- Completion celebrations
- Sync status updates
- Configurable in settings

## 🔧 Debugging

### Common Issues & Solutions

#### Missing Icons
- **Problem**: `icon-192x192.png` or `icon-512x512.png` not found
- **Solution**: Run `npm run generate-icons` or open `create-icons.html`

#### Service Worker Not Registering
- **Problem**: App doesn't work offline
- **Solution**: Check browser console for errors, ensure HTTPS or localhost

#### Manifest Issues
- **Problem**: "Add to Home Screen" not working
- **Solution**: Validate manifest.json using the debug script

#### Android SDK Issues
- **Problem**: Cannot build APK locally
- **Solution**: Use PWA Builder cloud service instead

### Debug Checklist
- [ ] All icon files present (192x192, 512x512)
- [ ] manifest.json is valid JSON
- [ ] Service worker registered successfully
- [ ] PWA installable in browser
- [ ] Offline functionality works
- [ ] All features tested on mobile

## 📋 Project Structure

```
homework-tracker/
├── index.html                    # Main app interface
├── create-assignment-enhanced.html # Enhanced assignment creation
├── login.html                   # Login page
├── manifest.json               # PWA manifest
├── enhanced-sw.js              # Enhanced service worker
├── styles.css                  # Glassmorphic styles
├── animations.css              # 60fps animations
├── settings.css               # Settings page styles
├── enhanced-script.js          # Main app logic
├── enhanced-settings.js        # Settings manager
├── assignment-editor.js        # Assignment editing
├── background-manager.js       # Background customization
├── api-integration.js          # Canvas/Google Classroom APIs
├── paid-features/             # Premium features folder
│   ├── advanced-analytics.js   # Productivity reports
│   ├── cloud-sync.js           # Cross-device sync
│   └── premium-themes.js       # Special themes
├── android-config.json         # Android PWA config
└── package.json               # Project metadata
```

## 🔧 API Integration Setup

### Canvas LMS Integration
1. Open Settings > API Integration
2. Click "Connect Canvas LMS"
3. OAuth flow handles authentication automatically
4. Assignments sync in real-time
5. Blue color streak indicates Canvas assignments

### Google Classroom Integration
1. Open Settings > API Integration
2. Click "Connect Google Classroom"
3. Google OAuth handles authentication
4. Courses and assignments sync automatically
5. Green color streak indicates Classroom assignments

### Offline Queue
- Failed syncs queued automatically
- Background sync processes queue when online
- User-friendly error messages
- Retry mechanisms with exponential backoff

### Data Management
- **Export**: Download all data as JSON
- **Import**: Upload previously exported data
- **Clear**: Reset all assignments and settings
- **Sync Status**: Real-time connection indicators

## 💎 Premium Features

### Advanced Analytics
- Productivity reports and trends
- Completion streak tracking
- Subject-wise breakdown
- Time management insights
- Visual dashboards with charts

### Cloud Sync
- Cross-device backup and sync
- Real-time data synchronization
- Conflict resolution
- Multiple device support
- Secure cloud storage

### Premium Themes
- Neon Glow effects
- Holographic backgrounds
- Particle systems
- Advanced animations
- Exclusive color schemes

### Upgrade System
- Feature gating for free users
- Upgrade prompts and CTAs
- Premium badge indicators
- Trial periods and demos

## 🚀 Development & Deployment

### Local Development
1. Serve files via local server (Python: `python -m http.server`)
2. Open `http://localhost:8000` in browser
3. Enable service worker and PWA features
4. Test API integrations with real accounts

### Production Deployment
1. Upload files to web server with HTTPS
2. Ensure service worker registration
3. Test PWA installation on mobile
4. Configure push notification keys
5. Set up API OAuth credentials

### Android APK Build
1. Use PWA Builder: https://www.pwabuilder.com
2. Enter your deployed app URL
3. Configure Android settings
4. Download and sign APK
5. Test on Android devices

## 🔍 Troubleshooting

### Common Issues

#### Service Worker Not Loading
- Ensure HTTPS or localhost
- Check browser console for errors
- Clear browser cache and reload
- Verify `enhanced-sw.js` is accessible

#### API Integration Failures
- Check network connectivity
- Verify OAuth credentials
- Review browser console for API errors
- Test with different accounts

#### Offline Functionality Issues
- Confirm service worker registration
- Check IndexedDB storage
- Test offline mode in DevTools
- Verify background sync queue

#### Assignment Sync Problems
- Check API connection status in settings
- Review sync queue in DevTools > Application
- Test manual sync triggers
- Verify assignment data format

### Debug Tools
- Browser DevTools > Application tab
- Service Worker status and cache
- IndexedDB data inspection
- Network tab for API calls
- Console for error messages

## 🎯 Usage Tips

### Getting Started
1. Create your first assignment using the enhanced creation page
2. Connect Canvas LMS or Google Classroom for automatic sync
3. Customize colors and themes in Settings
4. Enable notifications for deadline reminders
5. Install as PWA for native app experience

### Best Practices
- Use priority levels to organize assignments
- Set up background patterns or images for personalization
- Enable dark mode for better night usage
- Regularly sync with your learning management systems
- Export data periodically as backup

### Power User Features
- Edit assignments by long-pressing cards
- Use calendar view for deadline visualization
- Customize card colors for visual organization
- Set up push notifications for important deadlines
- Explore premium features for advanced analytics

## 📄 License

MIT License - Open source and free to use

---

**Built with modern web technologies**: Glassmorphic design, PWA standards, real-time API integration, and offline-first architecture for the ultimate homework tracking experience.
