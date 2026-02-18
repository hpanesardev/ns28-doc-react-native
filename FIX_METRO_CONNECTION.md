# Fix Metro Bundler Connection for iPad

## Your Mac's IP Address: `192.168.1.90`

## Quick Fix Steps:

### 1. Make sure Metro bundler is running:
```bash
npm start
```
Keep this terminal open and running.

### 2. Ensure iPad and Mac are on the SAME WiFi network
- Check WiFi settings on both devices
- They must be connected to the same network

### 3. Configure the bundle URL manually on iPad:

**Option A: Using Xcode Dev Menu (Easiest)**
1. In Xcode, go to: `Device > Shake Gesture` (simulates shake on iPad)
2. Or use: `Debug > Attach to Process > ns28-ipad`
3. In the Dev Menu, select "Configure Bundler" or "Dev Settings"
4. Set Debug server host & port to: `192.168.1.90:8081`
5. Reload the app

**Option B: Shake iPad (if enabled)**
1. Shake your iPad (or use Xcode's shake gesture)
2. Select "Configure Bundler"
3. Enter: `192.168.1.90:8081`
4. Reload

**Option C: Test connection first**
1. On iPad, open Safari
2. Go to: `http://192.168.1.90:8081/status`
3. Should show: `{"status":"packager_status:running"}`
4. If this works, the connection is fine - just need to configure the app

### 4. If still not working, restart Metro with explicit host:
```bash
# Stop current Metro (Ctrl+C)
# Then restart with:
npm start -- --host 192.168.1.90
```

### 5. Check Mac Firewall:
- System Settings > Network > Firewall
- Make sure Node.js is allowed, or temporarily disable firewall to test

## Verify Metro is Running:
Open in browser on Mac: `http://localhost:8081/status`
Should show: `{"status":"packager_status:running"}`

## After Configuration:
Once configured, the app should connect and you'll see the splash screen and login screen.
