#!/bin/bash

# Assignment Tracker APK Build Script
# This script helps convert the PWA to an Android APK

echo "🚀 Assignment Tracker APK Builder"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install Bubblewrap globally if not already installed
echo "📦 Installing/updating Bubblewrap CLI..."
npm install -g @bubblewrap/cli

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME environment variable is not set."
    echo "Please install Android Studio and set ANDROID_HOME to your Android SDK path."
    echo "Example: export ANDROID_HOME=/path/to/Android/Sdk"
    exit 1
fi

# Create a temporary directory for the build
BUILD_DIR="assignment-tracker-apk"
if [ -d "$BUILD_DIR" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf "$BUILD_DIR"
fi

echo "📁 Creating build directory..."
mkdir "$BUILD_DIR"
cd "$BUILD_DIR"

# Copy all project files
echo "📋 Copying project files..."
cp -r ../*.html ../*.js ../*.css ../*.json ../*.png ../*.ico . 2>/dev/null || true

# Start a local server to serve the files
echo "🌐 Starting local server..."
python3 -m http.server 8080 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Initialize Bubblewrap project
echo "🔧 Initializing Bubblewrap project..."
bubblewrap init --manifest http://localhost:8080/manifest.json --directory . || {
    echo "❌ Failed to initialize Bubblewrap project"
    kill $SERVER_PID
    exit 1
}

# Build the APK
echo "🔨 Building APK..."
bubblewrap build || {
    echo "❌ Failed to build APK"
    kill $SERVER_PID
    exit 1
}

# Stop the server
kill $SERVER_PID

# Copy the APK to the parent directory
if [ -f "app-release.apk" ]; then
    cp app-release.apk ../assignment-tracker.apk
    echo "✅ APK built successfully: assignment-tracker.apk"
else
    echo "❌ APK file not found. Build may have failed."
    exit 1
fi

# Clean up
cd ..
rm -rf "$BUILD_DIR"

echo "🎉 APK build completed successfully!"
echo "📱 You can now install assignment-tracker.apk on your Android device."
