# NS28 iPad - React Native App

A React Native CLI project configured for iOS and Android devices with real-time editing support.

## Bundle ID / Package Name
- **iOS Bundle ID**: `nmjewellery.pvccoders.ch`
- **Android Package**: `nmjewellery.pvccoders.ch`

## Prerequisites

Before running the project, make sure you have installed:

- **Node.js** (v18 or higher)
- **React Native CLI**: `npm install -g react-native-cli`
- **iOS Development**:
  - Xcode (latest version)
  - CocoaPods: `sudo gem install cocoapods`
  - iOS Simulator or physical iOS device
- **Android Development**:
  - Android Studio
  - Android SDK
  - Android Emulator or physical Android device

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install iOS dependencies:
```bash
cd ios
pod install
cd ..
```

## Running the App

### iOS

#### On Simulator:
```bash
npm run ios
```

#### On Physical Device:
1. Open `ios/ns28-ipad.xcworkspace` in Xcode
2. Select your device from the device list
3. Click Run (or press Cmd+R)

**Note**: Make sure your device is connected and trusted. You may need to configure code signing in Xcode.

### Android

#### On Emulator:
```bash
npm run android
```

#### On Physical Device:
1. Enable Developer Options and USB Debugging on your Android device
2. Connect your device via USB
3. Run:
```bash
npm run android
```

## Development with Real-Time Editing

The app is configured for real-time editing (Hot Reload/Fast Refresh):

1. Start Metro bundler:
```bash
npm start
```

2. In a separate terminal, run the app:
```bash
# For iOS
npm run ios

# For Android
npm run android
```

3. Make changes to your code - the app will automatically reload!

## Project Structure

```
ns28-ipad/
├── App.js                    # Main app component
├── index.js                  # Entry point
├── package.json              # Dependencies
├── src/                      # Source code
│   ├── screens/              # Screen components
│   │   ├── SplashScreen.js   # Splash screen
│   │   ├── LoginScreen.js    # Login screen
│   │   └── index.js          # Screen exports
│   ├── navigation/           # Navigation setup
│   │   └── AppNavigator.js   # Main navigator
│   ├── components/          # Reusable components
│   │   └── index.js
│   ├── constants/           # App constants
│   │   ├── colors.js        # Color constants
│   │   └── index.js
│   └── assets/              # Images, fonts, etc.
├── ios/                      # iOS native project
│   ├── ns28-ipad/           # iOS app source
│   └── Podfile              # CocoaPods dependencies
└── android/                 # Android native project
    └── app/                 # Android app source
```

## Screens

### Splash Screen
- Displays app logo and loading indicator
- Automatically navigates to Login screen after 2 seconds
- Dark theme with branded colors

### Login Screen
- Email and password input fields
- Form validation
- Sign in button with loading state
- Forgot password link
- Keyboard-aware layout for better UX

## Navigation

The app uses React Navigation with a stack navigator:
- **Splash** → Initial screen (auto-navigates to Login)
- **Login** → Authentication screen

You can add more screens by:
1. Creating new screen components in `src/screens/`
2. Adding them to `src/navigation/AppNavigator.js`
3. Exporting them from `src/screens/index.js`

## Troubleshooting

### iOS Issues
- If pods fail to install, try: `cd ios && pod deintegrate && pod install`
- Make sure Xcode Command Line Tools are installed: `xcode-select --install`

### Android Issues
- Make sure Android SDK is properly configured
- Check that `ANDROID_HOME` environment variable is set
- Ensure Gradle wrapper has execute permissions: `chmod +x android/gradlew`

### Metro Bundler Issues
- Clear cache: `npm start -- --reset-cache`
- Clear watchman: `watchman watch-del-all`

## Next Steps

1. ✅ Splash screen - Complete
2. ✅ Login screen - Complete
3. Add authentication logic and API integration
4. Create home/dashboard screen after login
5. Add more screens and components as needed
6. Configure app icons and splash screens
7. Set up app signing for production builds

## License

This project is private and proprietary.
