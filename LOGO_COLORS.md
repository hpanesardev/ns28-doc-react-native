# Logo Colors Configuration

## Current Color Scheme

The app uses a professional color palette. To match your logo colors exactly, update the colors in:

**File:** `src/constants/colors.js`

## Current Colors:

- **Primary:** `#1a1a2e` (Dark navy blue)
- **PVC Primary:** `#0066CC` (Blue - placeholder)
- **PVC Secondary:** `#FF6600` (Orange - placeholder)

## To Update Logo Colors:

1. **Get your logo colors:**
   - Extract the primary colors from your logo
   - Use a color picker tool or design software

2. **Update `src/constants/colors.js`:**
   ```javascript
   export const Colors = {
     primary: '#YOUR_PRIMARY_COLOR',
     pvcPrimary: '#YOUR_PVC_PRIMARY_COLOR',
     pvcSecondary: '#YOUR_PVC_SECONDARY_COLOR',
     // ... other colors
   };
   ```

3. **The colors are used in:**
   - Splash screen background and text
   - Login screen logo, buttons, and text
   - All UI elements throughout the app

## Where Colors Are Applied:

- **Splash Screen:** Primary background, white text
- **Login Screen:** Logo uses primary color, button uses primary color
- **"Powered by PVC" text:** Light gray (can be updated to PVC brand color)

## Quick Update:

If you have specific hex colors from your logo, share them and I can update the color constants file for you.
