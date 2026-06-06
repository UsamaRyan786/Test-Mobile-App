# Math Garden

A colorful Expo React Native app that helps children practice basic math through short, playful games. Each game runs for **8 rounds**, tracks **high scores** on the device, and uses kid-friendly visuals, animations, and encouraging feedback.

Also published in Expo as **Number Match Garden** (`number-match-garden`).

## Features

- **12 math mini-games** covering counting, addition, subtraction, multiplication, comparison, patterns, and number sense
- **High score tracking** saved locally with AsyncStorage
- **Home screen summary** showing top score, total plays, and per-game best scores on each game card
- **High Scores dashboard** with stats, star ratings, and a sorted leaderboard for all games
- **Animated UI** with gradients, bouncing dots, button feedback, and progress bar
- **Portrait-only**, light theme, optimized for phones via **Expo Go**

## Games

| Game | ID | Skill |
|------|----|-------|
| Number Match Garden 🌻 | `match` | Count dots and pick the matching number |
| Addition Adventure 🚀 | `addition` | Add two numbers |
| Subtraction Safari 🦁 | `subtraction` | Subtract small numbers |
| Multiplication Meadow 🌸 | `multiplication` | Multiply numbers (2–5 times tables) |
| Compare Castle 🏰 | `compare` | Pick the **bigger** number |
| Number Ninja 🥷 | `sequence` | Complete a counting pattern |
| Make Ten Magic ✨ | `makeTen` | Find the missing number to make 10 |
| Double Trouble 🪞 | `doubles` | Double a number |
| Smaller Swamp 🐸 | `smaller` | Pick the **smaller** number |
| Missing Mystery 🔍 | `missingAdd` | Find the hidden number in a sum |
| Countdown Cave 🦇 | `countBack` | Count backwards |
| Before & After 🎢 | `beforeAfter` | What number comes before or after |

Each round presents **4 answer choices**. A full session is **8 rounds**. Stars are awarded at the end based on score (up to 3 stars).

## High scores

Scores are stored on the device under the key `@mathGarden/highScores`.

For each game the app saves:

- **best** — highest score out of 8
- **plays** — how many times the game was completed
- **lastScore** — score from the most recent run

High scores appear on:

1. The **home / game selection** screen (summary bar + badge on each game card)
2. The **🏆 High Scores** dashboard (full list, sorted by best score)
3. The **in-game panel** (Score, Round, and Best)

## Tech stack

| Package | Purpose |
|---------|---------|
| [Expo](https://expo.dev/) ~54 | App runtime and tooling |
| React 19 | UI framework |
| React Native 0.81 | Mobile components |
| `expo-linear-gradient` | Gradient backgrounds and cards |
| `@react-native-async-storage/async-storage` | Persistent high scores |

## Prerequisites

- **Node.js** (LTS recommended)
- **npm**
- **Expo Go** on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Phone and computer on the **same Wi‑Fi** when using LAN mode

## Getting started

### 1. Clone or open the project

```powershell
cd "D:\Test Proect"
```

### 2. Install dependencies

```powershell
npm install
```

### 3. Start the development server

For testing in **Expo Go** (recommended):

```powershell
npx expo start -c --lan
```

Then:

1. Open **Expo Go** on your phone.
2. Scan the **QR code** from the terminal or browser.
3. Wait for the bundle to load — **Math Garden** should open.

Other start options:

```powershell
npm start
npx expo start
npx expo start --web
```

> **Note:** `npm run android` and `npm run ios` run native builds and require Android Studio / Xcode. Use `npx expo start` if you only want **Expo Go**.

## NPM scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Build and run on Android (native tooling required) |
| `npm run ios` | Build and run on iOS (macOS + Xcode required) |
| `npm run web` | Start Expo for web |

## Project structure

```
.
├── App.js              # Main app: games, UI, animations, high scores
├── app.json            # Expo config (name, slug, SDK, splash)
├── package.json        # Dependencies and scripts
├── babel.config.js     # Babel / Metro preset (expo)
├── README.md           # This file
└── .expo/              # Local Expo dev cache (generated)
```

All game logic, screens, and styles live in a single **`App.js`** file:

- **Screens:** menu (game picker), game play, high scores dashboard
- **Constants:** `MAX_ROUNDS = 8`, game list, theme colors
- **Storage:** `loadHighScores()` / `saveHighScore()`

## Configuration

Key values in `app.json`:

- **SDK:** 54.0.0
- **Orientation:** portrait
- **Splash background:** `#e9f7ee`
- **Android package:** `com.anonymous.numbermatchgarden`

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Expo Go SDK mismatch | Update Expo Go from the app store; project uses **Expo SDK 54** |
| App won’t connect | Same Wi‑Fi, disable VPN/firewall, use `--lan` |
| Stale bundle / old UI | Restart with cache clear: `npx expo start -c` |
| Metro port conflict | Accept the alternate port and rescan the QR code |
| High scores missing | Scores are local to the device; reinstalling Expo Go may clear them |

## License

Private project (`"private": true` in `package.json`).
