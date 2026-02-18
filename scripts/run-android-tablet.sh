#!/usr/bin/env bash
set -euo pipefail

if [ -f "$HOME/.zshrc" ]; then
  # Load SDK/JDK paths configured for local shell.
  # shellcheck disable=SC1090
  source "$HOME/.zshrc"
fi

AVD_NAME="${ANDROID_TABLET_AVD:-Medium_Phone_API_36.1}"

# Ensure Metro is reachable before app launch.
if ! curl -sf "http://127.0.0.1:8081/status" | awk '/packager-status:running/ { found=1 } END { exit(found ? 0 : 1) }'; then
  echo "Starting Metro on 8081..."
  nohup npm start -- --host 0.0.0.0 --port 8081 >/tmp/ns28-metro.log 2>&1 &
  for _ in $(seq 1 30); do
    if curl -sf "http://127.0.0.1:8081/status" | awk '/packager-status:running/ { found=1 } END { exit(found ? 0 : 1) }'; then
      break
    fi
    sleep 1
  done
fi

if ! adb devices | awk 'NR>1 && $1 ~ /^emulator-[0-9]+$/ && $2 == "device" { found=1 } END { exit(found ? 0 : 1) }'; then
  echo "Starting tablet AVD: $AVD_NAME"
  emulator -avd "$AVD_NAME" >/tmp/ns28-android-emulator.log 2>&1 &
fi

echo "Waiting for emulator to boot..."
adb wait-for-device
BOOT_STATE=""
for _ in $(seq 1 90); do
  BOOT_STATE="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')"
  if [ "$BOOT_STATE" = "1" ]; then
    break
  fi
  sleep 2
done

if [ "$BOOT_STATE" != "1" ]; then
  echo "Emulator boot timed out."
  exit 1
fi

# Ensure app can always reach Metro on host.
adb reverse tcp:8081 tcp:8081 || true

# Metro is already running per workflow; avoid opening a new terminal window.
npx react-native run-android --no-packager
