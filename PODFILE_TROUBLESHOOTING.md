# Podfile Troubleshooting

If `pod install` hangs or doesn't respond, try these solutions:

## Solution 1: Run with verbose output
```bash
cd ios
pod install --verbose
```
This will show you exactly where it's hanging.

## Solution 2: Clear CocoaPods cache
```bash
cd ios
rm -rf Pods Podfile.lock
pod cache clean --all
pod install --repo-update
```

## Solution 3: Update CocoaPods
```bash
sudo gem install cocoapods
pod setup
```

## Solution 4: Use repo update flag
```bash
cd ios
pod install --repo-update
```

## Solution 5: If still hanging, try manual install
If `use_native_modules!` continues to hang, you can temporarily comment it out and manually add pods:

1. Comment out `config = use_native_modules!`
2. Manually add required pods in the Podfile
3. Run `pod install`

## Common Causes:
- Large node_modules directory causing slow scanning
- Network issues when fetching pod specs
- Corrupted CocoaPods cache
- Outdated CocoaPods version

## Quick Fix:
Try running pod install in verbose mode first to see where it hangs:
```bash
cd ios && pod install --verbose
```
