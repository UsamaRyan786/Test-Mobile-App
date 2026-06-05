# Number Match Garden

A simple Expo React Native app for matching numbers to dot groups.

## Prerequisites

- Node.js installed
- npm installed
- Expo CLI available via `npx` (no global install required)
- Expo Go installed on your phone
- Phone and computer on the same Wi-Fi network for LAN mode

## Install dependencies

```powershell
cd "D:\Test Proect"
npm install
```

## Run the app in Expo Go

Use the Expo development server and scan the QR code in Expo Go.

```powershell
cd "D:\Test Proect"
npx expo start -c --lan
```

Then:

1. Open Expo Go on your phone.
2. Scan the QR code displayed in the browser/terminal.
3. Your app should load in Expo Go.

## Notes

- Do not use `npx expo run:android` if you only want to test in Expo Go. That command requires Android SDK and `adb`.
- If Expo Go still shows an SDK mismatch, make sure the project uses Expo SDK 54 and your Expo Go app is updated.
- If the Metro server cache is stale, use `--clear`.

## Project files

- `App.js` — main application screen
- `app.json` — Expo app configuration
- `package.json` — dependencies and scripts
- `babel.config.js` — Metro/Babel configuration

## Common commands

```powershell
# Start Expo with a clear cache
deps\> npx expo start -c --lan

# Start Expo normally
npx expo start

# Install dependencies
npm install
```

## Troubleshooting

- If Expo Go cannot connect, verify Wi-Fi and disable VPN or firewall temporarily.
- If Metro is using the wrong port, accept the suggested alternate port and rescan.
- If the project has stale native files from `expo run`, remove the `android` and `.expo` folders then restart Expo.
