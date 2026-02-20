# Signature JPG Black Image on iOS – Fix Note

**Problem:** On iOS, when the user signs in the agreement screen and the signature is exported as JPG, the uploaded image is **solid black** instead of **black signature on white background**.

**Root cause:** JPEG has no transparency. The signature canvas uses a transparent background. In WebKit/Safari (iOS WKWebView), when you call `canvas.toDataURL('image/jpeg')` on a canvas with transparent pixels, those transparent pixels are encoded as **black**. Result: black strokes + black “background” = full black image. A delay alone does not fix this.

**Fix:** For `image/jpeg`, do **not** call `toDataURL` on the signature canvas directly. Instead:

1. Create an **offscreen canvas** with the same dimensions as the signature canvas.
2. **Fill it with white** (`#FFFFFF`) using `fillRect`.
3. **Draw the signature canvas on top** with `drawImage(signaturePad.canvas, 0, 0)`.
4. Call **`toDataURL('image/jpeg')` on the offscreen canvas** and use that data URL.

So the JPEG encoder only ever sees opaque pixels (white + black strokes), and no transparent pixels are turned into black.

**Where the fix lives:**

- **Patched package:** `react-native-signature-canvas@5.0.2`
- **Patched file:** `node_modules/react-native-signature-canvas/h5/js/app.js`
- **Patch file:** `patches/react-native-signature-canvas+5.0.2.patch`

The patch is applied automatically by `patch-package` on `npm install` (see `postinstall` in `package.json`).

**If the issue comes back (e.g. after upgrading the library):**

1. Open `node_modules/react-native-signature-canvas/h5/js/app.js`.
2. Find the `readSignature()` function and the block that does `signaturePad.toDataURL(imageType)`.
3. For `imageType === 'image/jpeg'` only:
   - Get `signaturePad.canvas` and its `width`/`height`.
   - Create a new canvas with `document.createElement('canvas')`, set same width/height.
   - Get 2d context, set `fillStyle = '#FFFFFF'`, call `fillRect(0, 0, w, h)`.
   - Call `ctx.drawImage(signaturePad.canvas, 0, 0)`.
   - Use `offCanvas.toDataURL('image/jpeg')` as the export URL instead of `signaturePad.toDataURL(imageType)`.
4. Regenerate the patch:  
   `npx patch-package react-native-signature-canvas`

**Reference:** This fix was added in response to iOS signature JPG export returning a full black image; the white-canvas composite ensures a correct white background in the JPEG.
