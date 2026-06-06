# Math Garden

A colorful Expo React Native app that helps children practice basic math through short, playful games. Each game runs for **12 questions**, tracks **high scores**, awards **garden coins** and **badges**, and uses kid-friendly visuals, animations, and encouraging feedback.

Also published in Expo as **Number Match Garden** (`number-match-garden`).

## Features

- **12 math mini-games** covering counting, addition, subtraction, multiplication, comparison, patterns, and number sense
- **12 questions per game** with 4 multiple-choice answers each
- **Star ratings** (0–3 stars) based on final score
- **High score tracking** saved locally with AsyncStorage
- **Garden coins & badges** — earn coins and unlock **162 achievement badges**
- **Home screen summary** — coins, badge progress, top score, and per-game best scores on each card
- **High Scores dashboard** — stats, sorted leaderboard, and full badge collection
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

## Gameplay

- Each session has **12 rounds** (`MAX_ROUNDS = 12`).
- Every round shows **4 answer choices**.
- The in-game panel displays **Score**, **Round**, and **Best** for the current game.

### Star ratings

| Stars | Score needed (out of 12) |
|-------|--------------------------|
| ★★★ | 10 or more |
| ★★ | 8 or more |
| ★ | 5 or more |

## High scores

Stored on the device under `@mathGarden/highScores`.

For each game the app saves:

| Field | Description |
|-------|-------------|
| `best` | Highest score out of 12 |
| `plays` | Times the game was completed |
| `lastScore` | Score from the most recent run |

High scores appear on:

1. **Home screen** — summary bar + **Best** badge on each game card
2. **🏆 High Scores dashboard** — full list sorted by best score
3. **In-game panel** — Score, Round, and Best

## Rewards

Stored on the device under `@mathGarden/rewards` as `{ coins, badges, stats }`.

- **coins** — total garden coins
- **badges** — map of unlocked badge IDs to timestamps
- **stats.recordBreaks** — lifetime high score records broken
- **stats.totalCorrect** — lifetime correct answers across all games

### Garden coins

Earned at the end of each completed game:

| Reward | Coins |
|--------|-------|
| Per correct answer | +2 |
| Finish bonus | +10 |
| Per star earned | +8 |
| Perfect score (12/12) | +40 |
| New high score | +15 |
| Badge unlock | +badge reward (see below) |

Coins are shown on the **home screen** and **dashboard**. The **finish screen** shows coins earned and any new badges.

### Badges (162 total)

Badges are defined in `badges.js` and grouped by category on the dashboard. Locked badges appear grayed out until unlocked. Each badge also grants bonus coins.

| Category | Examples |
|----------|----------|
| 🌱 **Starter** | First Steps, Star Hunter, Math Master, Record Breaker |
| 🎯 **Milestones** | Complete 2, 5, 10, 25, 50, 100, 150+ games |
| 🪙 **Coin Hunter** | Collect 25, 100, 500, 2000, 5000+ garden coins |
| 🗺️ **Explorer** | Try 2, 5, 8, 10+ different games |
| 💯 **Mastery** | Perfect games; 3-star & 2-star games; combined best-score totals |
| 🏆 **Records** | Break 1, 3, 5, 10, 30+ high scores (lifetime) |
| 🧠 **Accuracy** | 30, 60, 120, 500, 1000, 2000+ lifetime correct answers |
| ⚡ **Session** | Score 6+, 8+, 10+, or 11+ in a single game |
| 🎮 **Game Badges** | Per game: play 5×, play 10×, perfect 12/12, earn 3 stars |
| 🥇 **Skills** | Per game: score 10+ in one run (Ace badges) |
| 🎖️ **Legend** | Unlock 6, 25, 50, 75, or 100 total badges |

**Starter badges** (original 12):

| Badge | Unlock condition | Bonus |
|-------|------------------|-------|
| 🌱 First Steps | Complete your first game | 10 |
| ⭐ Star Hunter | Earn 2 stars in any game | 15 |
| 🌟 Super Star | Earn 3 stars in any game | 25 |
| 💯 Perfect Run | Get 12/12 in any game | 50 |
| 🗺️ Game Explorer | Try 4 different games | 20 |
| 👑 Math Master | Try all 12 games | 60 |
| 🪙 Coin Collector | Collect 100 garden coins | 20 |
| 🔥 On Fire! | Complete 20 games total | 30 |
| 🏆 Record Breaker | Set a new high score | 15 |
| 🚀 Addition Fan | Play Addition Adventure 3 times | 15 |
| 🌻 Counting Champ | Perfect score in Number Match Garden | 25 |
| 🎖️ Badge Legend | Unlock 6 badges | 40 |

The finish screen shows up to 3 new badges at a time (with a count if more were unlocked).

## Screens

| Screen | Purpose |
|--------|---------|
| **Menu** | Pick a game; view coins, badges, and high score summary |
| **Game** | Play 12 rounds; see score, progress, and personal best |
| **Dashboard** | High scores, coins, and **162 badges** by category |

## Tech stack

| Package | Purpose |
|---------|---------|
| [Expo](https://expo.dev/) ~54 | App runtime and tooling |
| React 19 | UI framework |
| React Native 0.81 | Mobile components |
| `expo-linear-gradient` | Gradient backgrounds and cards |
| `@react-native-async-storage/async-storage` | High scores, coins, and badges |

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
├── App.js              # Main app: games, UI, scores, rewards
├── badges.js           # 162 badge definitions and unlock logic
├── app.json            # Expo config (name, slug, SDK, splash)
├── package.json        # Dependencies and scripts
├── babel.config.js     # Babel / Metro preset (expo)
├── README.md           # Project documentation (keep in sync with code)
└── .expo/              # Local Expo dev cache (generated)
```

All game logic, screens, and styles live in **`App.js`**. Badge definitions and evaluation live in **`badges.js`**.

| Area | Details |
|------|---------|
| **Screens** | Menu, game play, high scores dashboard |
| **Constants** | `MAX_ROUNDS = 12`, `GAMES`, theme colors |
| **Storage keys** | `@mathGarden/highScores`, `@mathGarden/rewards` |
| **Functions** | `loadHighScores`, `saveHighScore`, `loadRewards`, `applyRewards` |
| **Badges** | `buildBadges`, `evaluateBadges`, `updateRewardStats` in `badges.js` |

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
| Scores or rewards missing | Data is local to the device; reinstalling Expo Go may clear it |

## License

Private project (`"private": true` in `package.json`).
