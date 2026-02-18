# Running on Android Tablet Simulator

## Quick Start

### Option 1: Using Android Studio (Recommended - Easiest)

1. **Open Android Studio**
2. **Open AVD Manager:**
   - Click on "More Actions" → "Virtual Device Manager"
   - Or go to: `Tools` → `Device Manager`
3. **Create a Tablet AVD:**
   - Click "Create Device"
   - Select a tablet profile (e.g., "Pixel Tablet" or "10.1" WXGA Tablet")
   - Click "Next"
   - Select a system image (e.g., "API 34" or latest available)
   - Click "Next" → "Finish"
4. **Start the Tablet Emulator:**
   - Click the Play button (▶️) next to your tablet AVD
   - Wait for it to boot up completely
5. **Run the app:**
   ```bash
   npm run android
   ```

### Option 2: Using Command Line

#### Step 1: List Available System Images
First, you need to install Android Studio and ensure command-line tools are set up, or use Android Studio's SDK Manager to install a system image.

#### Step 2: Create Tablet AVD via Command Line
```bash
# Set Android SDK path (add to ~/.zshrc for persistence)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Create a tablet AVD (example - adjust API level as needed)
avdmanager create avd -n "Tablet_API_34" -k "system-images;android-34;google_apis;x86_64" -d "pixel_tablet"
```

#### Step 3: Start the Tablet Emulator
```bash
# List available AVDs
emulator -list-avds

# Start the tablet emulator
emulator -avd Tablet_API_34 &
```

#### Step 4: Run the App
```bash
npm run android
```

## Running the App

### Method 1: Using npm script
```bash
# Make sure Metro bundler is running (in one terminal)
npm start

# In another terminal, run:
npm run android
```

### Method 2: Using React Native CLI directly
```bash
# Start Metro bundler
npm start

# In another terminal, run with specific device
npx react-native run-android
```

## Troubleshooting

### Emulator Not Starting
- Make sure Android Studio is installed
- Check that you have enough disk space (emulators need several GB)
- Try restarting Android Studio

### App Not Installing
- Make sure the emulator is fully booted (wait for home screen)
- Check that USB debugging is enabled (should be automatic for emulators)
- Try: `adb devices` to see if emulator is detected

### Build Errors
- Clean build: `cd android && ./gradlew clean && cd ..`
- Clear Metro cache: `npm start -- --reset-cache`
- Rebuild: `npm run android`

### App Crashes on Launch
- Check Metro bundler is running: `npm start`
- Check logs: `adb logcat | grep ReactNativeJS`
- Try clearing app data: Settings → Apps → Your App → Clear Data

## Recommended Tablet Profiles

For testing tablet layouts, use these profiles:
- **Pixel Tablet** (10.2" 2560x1600) - Modern Android tablet
- **10.1" WXGA Tablet** (1280x800) - Standard tablet size
- **7.0" WSVGA Tablet** (1024x600) - Smaller tablet

## Current Android Configuration

Your app is already configured for tablets:
- `AndroidManifest.xml` includes `requiresSmallestWidthDp="600"` (tablet requirement)
- Supports all screen sizes (smallScreens, normalScreens, largeScreens, xlargeScreens)

## Quick Commands

```bash
# List all AVDs
emulator -list-avds

# Start specific emulator
emulator -avd Tablet_API_34 &

# Check connected devices
adb devices

# View logs
adb logcat | grep ReactNativeJS

# Install app directly
adb install android/app/build/outputs/apk/debug/app-debug.apk
```
