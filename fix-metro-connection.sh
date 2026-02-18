#!/bin/bash

# Script to help fix Metro bundler connection issues

echo "🔍 Checking Metro bundler connection..."
echo ""

# Get Mac's IP address
MAC_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)

if [ -z "$MAC_IP" ]; then
    echo "❌ Could not detect Mac's IP address"
    echo "   Please check System Settings > Network"
    exit 1
fi

echo "✅ Mac IP Address: $MAC_IP"
echo ""
echo "📱 To fix the 'No bundle URL present' error:"
echo ""
echo "1. Make sure Metro is running: npm start"
echo ""
echo "2. Make sure iPad and Mac are on the SAME WiFi network"
echo ""
echo "3. Access Dev Menu on iPad:"
echo "   - Open Xcode"
echo "   - Go to: Device > Shake Gesture"
echo "   - Or: Debug > Attach to Process > ns28-ipad"
echo ""
echo "4. In Dev Menu, select 'Configure Bundler' or 'Dev Settings'"
echo "   Set Debug server host & port to: $MAC_IP:8081"
echo ""
echo "5. Reload the app (press 'r' in Metro terminal)"
echo ""
echo "6. Test Metro connection from iPad Safari:"
echo "   http://$MAC_IP:8081/status"
echo "   (Should show: {\"status\":\"packager_status:running\"})"
echo ""
