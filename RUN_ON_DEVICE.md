# Running on Real iPad Device

## Method 1: Using React Native CLI (Recommended)

1. **Make sure your iPad is connected and trusted:**
   - Connect iPad via USB
   - Unlock your iPad
   - Trust the computer when prompted on iPad

2. **Start Metro bundler:**
   ```bash
   npm start
   ```
   Keep this running in a terminal.

3. **In a new terminal, run on device:**
   ```bash
   npm run ios -- --device
   ```
   
   Or specify the device name:
   ```bash
   npm run ios -- --device "Your iPad Name"
   ```

## Method 2: Using Xcode (For Code Signing Setup)

1. **Open the workspace in Xcode:**
   ```bash
   open ios/ns28-ipad.xcworkspace
   ```
   ⚠️ **Important:** Open `.xcworkspace`, NOT `.xcodeproj`

2. **Select your iPad:**
   - At the top of Xcode, click the device selector (next to the play button)
   - Select your connected iPad from the list

3. **Configure Code Signing:**
   - Click on the project name "ns28-ipad" in the left sidebar
   - Select the "ns28-ipad" target
   - Go to "Signing & Capabilities" tab
   - Check "Automatically manage signing"
   - Select your Team (Apple ID)
   - Bundle Identifier should be: `nmjewellery.pvccoders.ch`

4. **Run the app:**
   - Click the Play button (▶️) or press `Cmd + R`
   - Xcode will build and install on your iPad

## Troubleshooting

### Device Not Showing Up
- Make sure iPad is unlocked
- Trust the computer on iPad
- Check USB cable connection
- Try disconnecting and reconnecting

### Code Signing Errors
- You need an Apple Developer account (free account works for development)
- Make sure "Automatically manage signing" is checked
- Bundle ID must be unique - if it's taken, you may need to change it

### Build Errors
- Make sure pods are installed: `cd ios && pod install`
- Clean build folder in Xcode: `Product > Clean Build Folder` (Shift+Cmd+K)
- Try: `cd ios && rm -rf build && pod install`

### Metro Bundler Not Connecting / "No bundle URL present" Error

**Common causes and solutions:**

1. **Metro bundler not running:**
   - Make sure `npm start` is running in a terminal
   - You should see "Dev server ready" message

2. **Network connectivity:**
   - **CRITICAL:** iPad and Mac must be on the **same WiFi network**
   - Disable VPN on both devices if active
   - Check Mac firewall: System Settings > Network > Firewall (allow Node.js if prompted)

3. **Access Dev Menu on iPad (shake gesture doesn't work):**
   - **Method 1:** In Xcode, go to `Device > Shake Gesture` (simulates shake)
   - **Method 2:** Add a 3-finger tap gesture (if enabled in iOS settings)
   - **Method 3:** Use Xcode's Debug menu: `Debug > Attach to Process > ns28-ipad`

4. **Manually configure bundle URL:**
   - Get your Mac's IP address: `ipconfig getifaddr en0` (or check System Settings > Network)
   - In the Dev Menu, select "Configure Bundler" or "Dev Settings"
   - Set Debug server host & port to: `YOUR_MAC_IP:8081` (e.g., `192.168.1.90:8081`)
   - Reload the app (press `r` in Metro terminal or shake/use Xcode menu)

5. **Reset Metro cache:**
   ```bash
   npm start -- --reset-cache
   ```

6. **Verify Metro is accessible:**
   - On your Mac, open browser and go to: `http://localhost:8081/status`
   - Should show: `{"status":"packager_status:running"}`
   - If this works, try from iPad's Safari: `http://YOUR_MAC_IP:8081/status`

## Quick Commands

```bash
# Start Metro bundler
npm start

# Run on connected device (in new terminal)
npm run ios -- --device

# Or open in Xcode
open ios/ns28-ipad.xcworkspace
```
