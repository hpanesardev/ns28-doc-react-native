# App Icon Setup Guide

## iOS App Icon

To add your app icon:

1. **Create a 1024x1024 PNG icon** with your logo/branding
   - No transparency
   - Square format
   - High resolution

2. **Add the icon file:**
   ```bash
   # Copy your icon to:
   ios/ns28-ipad/Images.xcassets/AppIcon.appiconset/AppIcon.png
   ```

3. **Update Contents.json** (already configured):
   - The Contents.json is set up for a universal 1024x1024 icon
   - Xcode will automatically generate all required sizes

4. **In Xcode:**
   - Open `ios/ns28-ipad.xcworkspace`
   - Select the project > ns28-ipad target
   - Go to "General" tab
   - Under "App Icons and Launch Screen", drag your icon to the AppIcon slot

5. **Rebuild the app:**
   ```bash
   npm run ios -- --device "iPad"
   ```

## Quick Setup (Using Xcode)

1. Open `ios/ns28-ipad.xcworkspace` in Xcode
2. In the project navigator, find `Images.xcassets` > `AppIcon`
3. Drag your 1024x1024 icon image to the "AppIcon" slot
4. Xcode will automatically generate all required sizes
5. Clean build folder (Shift+Cmd+K) and rebuild

## Icon Requirements

- **Format:** PNG (no transparency)
- **Size:** 1024x1024 pixels minimum
- **Design:** Should work well at small sizes (rounded corners added automatically by iOS)
- **Content:** Your logo/branding centered with appropriate padding

## Current Status

✅ Icon structure is ready
⏳ Waiting for icon image file
📝 Update `ios/ns28-ipad/Images.xcassets/AppIcon.appiconset/AppIcon.png`
