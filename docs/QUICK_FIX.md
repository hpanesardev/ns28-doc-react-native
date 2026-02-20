# Quick Fix for Metro Connection

## Your Mac's IP: `192.168.1.90`

## Steps to Fix:

### 1. Make sure Metro is running with network access:
```bash
# Stop current Metro (Ctrl+C), then:
npm start -- --host 0.0.0.0
```

### 2. Rebuild the app (Info.plist and AppDelegate were updated):
```bash
npm run ios -- --device "iPad"
```

### 3. The app should now connect!

## If Still Not Working:

### Check 1: Verify Metro is accessible
On your iPad's Safari, go to:
```
http://192.168.1.90:8081/status
```
Should show: `{"status":"packager_status:running"}`

### Check 2: Same WiFi Network
- iPad and Mac MUST be on the same WiFi network
- Check WiFi settings on both devices

### Check 3: Mac Firewall
- System Settings > Network > Firewall
- Temporarily disable to test, or allow Node.js

### Check 4: Update IP if it changed
If your Mac's IP address changed, update it in:
- `ios/ns28-ipad/AppDelegate.mm` (line with `192.168.1.90`)
- `ios/ns28-ipad/Info.plist` (NSAppTransportSecurity section)

### Check 5: Clean Build
```bash
cd ios
rm -rf build
cd ..
npm run ios -- --device "iPad"
```

## What Was Changed:
1. ✅ Info.plist - Added exception for Mac's IP (192.168.1.90)
2. ✅ AppDelegate.mm - Explicitly set bundle URL to Mac's IP
3. ✅ Metro should run with `--host 0.0.0.0`

## After Rebuild:
The app should automatically connect to Metro bundler at `192.168.1.90:8081`
