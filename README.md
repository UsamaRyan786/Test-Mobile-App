# Math Talk

A colorful Expo React Native app that helps children practice basic math through short, playful games. Each game runs for **12 questions**, tracks **high scores** (shown on a **5000-point** scale), awards **garden coins** and **badges**, and uses kid-friendly visuals, animations, and encouraging feedback.

Expo slug: **`number-match-garden`** (legacy package name).

## Math Classes (listen, answer, and watch)

Before jumping into games, kids join **Teacher Maya** for short spoken lessons with an animated **whiteboard**. A simple **teacher portrait** (👩‍🏫) appears beside the board while Maya teaches. Finish a class to unlock **only the games that class teaches** — not the whole category tree at once.

| # | Class | What it teaches | Unlocks |
|---|-------|-----------------|---------|
| 1 | 🔢 **Counting Class** | Count objects one by one | Counting games (dots, number match) |
| 2 | 🔷 **Shapes Class** | Circles, squares, triangles & more | Shape games (name, sides, count) |
| 3 | ⚖️ **Compare Class** | Bigger and smaller numbers | Compare games |
| 4 | 🦉 **Even & Odd Class** | Even vs odd numbers | Parity games |
| 5 | ➕ **Addition Class** | Putting groups together (+) | Addition games |
| 6 | ➖ **Subtraction Class** | Taking away (−) | Subtraction games |
| 7 | ✖️ **Multiplication Class** | Equal groups (×) | Multiplication games |
| 8 | ➗ **Division Class** | Sharing equally (÷) | Division games |
| 9 | 🔮 **Patterns Class** | Sequences and skip counting | Pattern games |
| 10 | 🎲 **Mixed Operations Class** | + − × ÷ together | Mixed games |
| 11 | 📐 **BODMAS Intro Class** | Order of operations overview | BODMAS Order Quiz |
| 12 | 🪝 **Brackets Class** | Brackets `( )` first | Bracket BODMAS games |
| 13 | ⏩ **Multiply & Divide First Class** | × and ÷ before + and − | ×÷-first BODMAS games |
| 14 | 🏆 **Full BODMAS Class** | Full rule: brackets → ×÷ → +− | Full BODMAS games |
| 15 | 🥇 **Challenge Class** | Expert mixed practice | Challenge games |

**Class order:** Counting → Shapes → Compare → Even & Odd → Addition → Subtraction → Multiplication → Division → Patterns → Mixed → BODMAS Intro → Brackets → ×÷ First → Full BODMAS → Challenge.

Class progress is saved in `@mathGarden/progress` under `lessons` (current step index and completion flag).

### Classroom experience

- **Teacher Maya** speaks each slide aloud (`expo-speech`) while the **whiteboard** draws circles, groups, and equations step by step
- **Simple teacher portrait** — a round 👩‍🏫 image with Maya’s name plate (no custom avatar figure); gentle pulse while she is speaking
- **Interactive counting:** Maya pauses and asks the child to say or tap the answer; correct answers get praise, wrong answers get a gentle “try again” without stopping the lesson
- **Board highlighting:** on counting slides, flowers/dots on the board are highlighted one by one as Maya counts; a 👇 marker points at the active item
- **Silence reprompt:** if no answer is heard for ~6 seconds (`ANSWER_SILENCE_MS`), Maya asks again politely
- **Next Step** stays disabled until Maya finishes the current slide narration (button shows “Listen to Teacher Maya first”)
- Tap **🔊 Hear again** to replay the teacher; captions show the same words on screen
- **Save & resume:** finish a step → leave and return later to **continue on the next step**; leave mid-step → **restart that same step**
- Class cards show **“Continue step N →”** when a class is in progress
- **Replay classes** anytime from the class list — replays do **not** change saved progress or re-lock games

### Strict game unlock rules

You can **only play games tied to classes you have finished**. The home screen groups games **by class**, not by loose categories. Locked sections show a hint (e.g. “Finish Compare Class first!”).

Unlock logic lives in `lessonMap.js` (`resolveLessonId`, `isGameUnlockedByLesson`, `getLessonGameSections`).

## Learning path & levels

### Learning path bar

The home screen shows a **step-by-step path** (Plus → Minus → Times → Divide → Patterns → Mixed → BODMAS → Challenge) that lights up as you complete the matching classes.

### 10 levels per game (2 tiers)

Every game has **10 levels** in two tiers:

| Tier | Description |
|------|-------------|
| 🌱 **Starter** | Levels 1–10 — numbers get slightly harder each level |
| 🔥 **Advanced** | Unlocks after passing all 10 Starter levels — same game, tougher numbers |

- Each level is one full game session (**12 questions**).
- **Pass a level:** score **8 or more** correct out of 12 (`PASS_SCORE` in `progression.js`).
- Passing a level unlocks the next level in that game.
- Progress is saved locally under `@mathGarden/progress`.

### Score display (5000 scale)

Gameplay still uses **12 rounds**, but scores are shown on a kid-friendly **0–5000** scale (perfect run = **5000/5000**). Internal correct counts (0–12) are scaled for display only (`MAX_SCORE = 5000` in `App.js`).

### Speak your answer (voice input)

During games, students can **tap the microphone** and **say the answer out loud** (e.g. “five”, “12”, “three”). The app listens and picks the matching choice. Tap buttons always work as a backup.

- Uses `expo-speech-recognition` (microphone + speech recognition permissions)
- Works in a **development build** (`npx expo run:android` / `run:ios`)
- In **Expo Go**, voice is unavailable — tap number buttons in games and class answer panels instead
- Supports spoken number words (one–twenty) and digits

## Features

- **Interactive Math Classes** — Teacher Maya at the whiteboard with a simple portrait, tap/voice answers on counting slides
- **Per-class game unlock** — finish Counting Class → counting games only; Compare Class → compare games only; and so on
- **Class replay** — review any completed class without resetting progress
- **User accounts** — sign in or create a profile; each learner keeps their own progress on the device
- **Reset all progress** — home-screen button clears classes, coins, badges, and scores for the signed-in account (with confirmation)
- **Speak your answer** — tap 🎤 in games (dev build) via `expo-speech-recognition`
- **83 math mini-games** covering counting, shapes, compare, even/odd, addition, subtraction, multiplication, division, patterns, mixed, BODMAS, and challenge modes
- **12 questions per game** with 4 multiple-choice answers each
- **Star ratings** (0–3 stars) based on correct answers out of 12
- **High score tracking** saved locally per account with AsyncStorage
- **Garden coins & badges** — earn coins and unlock **450+ achievement badges**
- **Home screen summary** — coins, badge progress, learning path, top score, and per-game best scores on each card
- **Grouped game menu** — sections follow the **15 Math Classes** order
- **High Scores dashboard** — stats, sorted leaderboard, and full badge collection
- **Animated UI** with gradients, bouncing dots, button feedback, and progress bar
- **Portrait-only**, light theme; test in **Expo Go**, voice in **dev builds**

## Games (83 total)

Games are defined in `games.js` and grouped on the home screen by **lesson** (`getLessonGameSections`):

| Category | Games | Examples |
|----------|-------|----------|
| 🔢 **Counting** | 3 | Number Match Garden, Tiny Dot Garden, Big Dot Field |
| 🔷 **Shapes** | 4 | Shape Spotter, Shape Match, Side Counter, Shape Count Garden |
| ⚖️ **Compare** | 3 | Compare Castle, Smaller Swamp, Big Compare Bay |
| 🦉 **Even & Odd** | 2 | Odd Owl, Even Elephant |
| ➕ **Addition** | 13 | Addition Adventure, Make Ten/Five/Twenty, Tiny Totals, Triple Add Trail |
| ➖ **Subtraction** | 5 | Subtraction Safari, Tiny Takeaway, Ten Takeaway, Same Number Subtract |
| ✖️ **Multiplication** | 17 | Multiplication Meadow, Times Table Tower, Times 2–9 Trails, Double/Triple Trouble |
| ➗ **Division** | 5 | Division Desert, Half Moon Math, Divide by One, Share Six Snacks |
| 🔮 **Patterns** | 11 | Number Ninja, Countdown Cave, Before & After, Step by 3/5, Skip Count 5s/10s |
| 🎲 **Mixed** | 8 | Arithmetic Arena, Missing Mystery (+/−/×/÷), Plus Minus Mix, Times Divide Dash |
| 📐 **BODMAS** | 8 | BODMAS Order Quiz, Bracket Basics, Multiply First, BODMAS Master |
| 🏆 **Challenge** | 4 | Math Marathon, Speedy Sums, Brain Trainer, Pattern Pro |

See `games.js` for the full list and round generators.

### Core games (first 15)

| Game | ID | Skill |
|------|----|-------|
| Number Match Garden 🌻 | `match` | Count dots and pick the matching number |
| Addition Adventure 🚀 | `addition` | Add two numbers |
| Subtraction Safari 🦁 | `subtraction` | Subtract small numbers |
| Multiplication Meadow 🌸 | `multiplication` | Multiply numbers (2–5 times tables) |
| Times Table Tower 🗼 | `timesTables` | Harder multiplication (2–9 times tables) |
| Division Desert 🏜️ | `division` | Divide numbers (clean answers, no remainders) |
| Arithmetic Arena ⚔️ | `mixed` | Random mix of **+**, **−**, **×**, and **÷** each round |
| Compare Castle 🏰 | `compare` | Pick the **bigger** number |
| Number Ninja 🥷 | `sequence` | Complete a counting pattern |
| Make Ten Magic ✨ | `makeTen` | Find the missing number to make 10 |
| Double Trouble 🪞 | `doubles` | Double a number (×2) |
| Smaller Swamp 🐸 | `smaller` | Pick the **smaller** number |
| Missing Mystery 🔍 | `missingAdd` | Find the hidden number in **+**, **−**, **×**, or **÷** equations |
| Countdown Cave 🦇 | `countBack` | Count backwards |
| Before & After 🎢 | `beforeAfter` | What number comes before or after |

## Gameplay

- Each session has **12 rounds** (`MAX_ROUNDS = 12`).
- Every round shows **4 answer choices**.
- The in-game panel displays **Score** (0–5000 scale), **Round**, and **Best**.

### Star ratings

Stars are based on **correct answers out of 12** (not the displayed 5000 score):

| Stars | Correct answers needed (out of 12) |
|-------|-------------------------------------|
| ★★★ | 10 or more |
| ★★ | 8 or more |
| ★ | 5 or more |

## User accounts

On launch, learners **sign in** or **create an account**. Each account stores its own:

- High scores (`@mathGarden/users/{userId}/highScores`)
- Rewards (`@mathGarden/users/{userId}/rewards`)
- Class and level progress (`@mathGarden/users/{userId}/progress`)

Account registry and session:

- `@mathGarden/accounts` — usernames and hashed passwords (SHA-256 + salt via `expo-crypto`)
- `@mathGarden/session` — currently signed-in user id

Passwords are **hashed on the device** and are **not sent to a server**. Progress is **device-local** unless you add cloud sync later.

Use **Sign out** on the home screen to switch learners on the same phone.

## High scores

Stored per signed-in user under `@mathGarden/users/{userId}/highScores`.

For each game the app saves:

| Field | Description |
|-------|-------------|
| `best` | Highest correct count out of 12 (displayed as x/5000) |
| `plays` | Times the game was completed |
| `lastScore` | Correct count from the most recent run |

High scores appear on:

1. **Home screen** — summary bar + **Best** badge on each game card
2. **🏆 High Scores dashboard** — full list sorted by best score
3. **In-game panel** — Score, Round, and Best

## Rewards

Stored per signed-in user under `@mathGarden/users/{userId}/rewards` as `{ coins, badges, stats }`.

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

### Badges (450+ total)

Badges are defined in `badges.js` (built from the game list) and grouped by category on the dashboard. Locked badges appear grayed out until unlocked. Each badge also grants bonus coins.

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

The finish screen shows up to 3 new badges at a time (with a count if more were unlocked).

## Screens

| Screen | Purpose |
|--------|---------|
| **Menu** | Pick a game by class section; coins, badges, learning path, reset progress |
| **Math Classes** | Browse, continue, or replay Teacher Maya lessons |
| **Classroom** | Whiteboard lesson with speech, captions, and optional tap/voice answers |
| **Level select** | Choose Starter/Advanced tier and level 1–10 |
| **Game** | Play 12 rounds; see score, progress, and personal best |
| **Dashboard** | High scores, coins, and badges by category |

## Tech stack

| Package | Purpose |
|---------|---------|
| [Expo](https://expo.dev/) ~54 | App runtime and tooling |
| React 19 | UI framework |
| React Native 0.81 | Mobile components |
| `expo-linear-gradient` | Gradient backgrounds and cards |
| `expo-speech` | Spoken math classes (Teacher Maya) |
| `expo-speech-recognition` | Students speak answers in games (dev build) |
| `expo-crypto` | Password hashing for local accounts |
| `@react-native-async-storage/async-storage` | Accounts, session, high scores, coins, badges, and lesson progress |

## Prerequisites

- **Node.js** (LTS recommended)
- **npm**
- **Expo Go** on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) for quick testing
- Phone and computer on the **same Wi‑Fi** when using LAN mode
- **Android Studio / Xcode** only if you need a native dev build (for voice input)

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

For testing in **Expo Go**:

```powershell
npx expo start -c --lan
```

Then:

1. Open **Expo Go** on your phone.
2. Scan the **QR code** from the terminal or browser.
3. Wait for the bundle to load — **Math Talk** should open.

For **voice input** in games and classes, use a dev build instead:

```powershell
npx expo run:android
# or on macOS with Xcode:
npx expo run:ios
```

### Standalone Android APK (no Metro on the phone)

Debug APKs normally need the Expo dev server. This project sets `debuggableVariants = []` in `android/app/build.gradle` so **debug builds also embed the JS bundle** — the APK can run on a device by itself after you rebuild.

**Release APK (recommended for sharing):**

```powershell
cd "D:\Test Proect"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
cd android
.\gradlew.bat assembleRelease
```

Install: `android\app\build\outputs\apk\release\app-release.apk`

If the build fails with **“Filename longer than 260 characters”**, move the project to a short path (e.g. `C:\MathTalk`) or enable [Windows long paths](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation).

Other start options:

```powershell
npm start
npx expo start
npx expo start --web
```

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
├── App.js              # Main app: UI, scores, rewards, screens, auth gate
├── authStorage.js      # Local accounts, session, password hashing
├── userStorage.js      # Per-user high scores, rewards, and progress keys
├── LoginScreen.js      # Sign in / create account screen
├── games.js            # 83 games, round generators, categories
├── shapes.js           # Basic shape definitions (circle, square, triangle, …)
├── lessons.js          # Core Math Classes content and lesson progress helpers
├── lessonsExtra.js     # Compare, Even/Odd, Patterns, Mixed, BODMAS, Challenge classes
├── lessonMap.js        # Per-class game unlock and home menu sections
├── LessonClassroom.js  # Classroom UI: teacher portrait, whiteboard, answers
├── lessonSpeech.js     # Text-to-speech narration and answer-step sequencing
├── teacherConfig.js    # Teacher name/label/emoji (Maya, Teacher Maya, 👩‍🏫)
├── voiceAnswer.js      # Speech-to-text answer parsing (optional native module)
├── VoiceAnswerPanel.js # Microphone UI in game screen
├── progression.js      # Level unlocks, PASS_SCORE, difficulty scaling
├── badges.js           # Badge definitions and unlock logic
├── app.json            # Expo config (name: Math Talk, slug, SDK, splash)
├── package.json        # Dependencies and scripts
├── babel.config.js     # Babel / Metro preset (expo)
├── README.md           # Project documentation
└── .expo/              # Local Expo dev cache (generated)
```

| Area | Details |
|------|---------|
| **Screens** | Login, menu (by class), classes list, classroom, level select, game play, dashboard |
| **Constants** | `MAX_ROUNDS = 12`, `MAX_SCORE = 5000`, `PASS_SCORE = 8`, `GAMES` from `games.js` |
| **Storage keys** | `@mathGarden/accounts`, `@mathGarden/session`, `@mathGarden/users/{userId}/…` |
| **Classes** | `LESSONS` (15 classes), `getResumeSlideIndex`, `saveLessonCheckpoint`, `markLessonStepComplete`, replay-safe progress in `lessons.js` |
| **Teacher** | `teacherConfig.js` — change `TEACHER_NAME`, `TEACHER_LABEL`, or `TEACHER_EMOJI` in one place |
| **Unlock** | `lessonMap.js` maps each game to a class; `progression.js` checks level/tier unlock |
| **Voice** | `voiceAnswer.js` + `VoiceAnswerPanel.js`; disabled in Expo Go when native module missing |

## Configuration

Key values in `app.json` and `teacherConfig.js`:

- **Name:** Math Talk
- **Teacher:** Maya (`Teacher Maya` in UI, `👩‍🏫` portrait)
- **SDK:** 54.0.0
- **Orientation:** portrait
- **Splash background:** `#e9f7ee`
- **Android package:** `com.anonymous.numbermatchgarden` — **change this** before Google Play (see below)

## Google Play Store checklist

Before publishing, you will need more than just the app code:

| Item | Status / action |
|------|-----------------|
| **Google Play Developer account** | $25 one-time fee at [play.google.com/console](https://play.google.com/console) |
| **Unique package name** | Change `com.anonymous.numbermatchgarden` in `app.json` to your own (e.g. `com.yourcompany.mathtalk`) |
| **Release signing key** | Generate a production keystore — do **not** ship with the debug keystore |
| **AAB upload** | Play Store requires an **Android App Bundle** (`.aab`), not only `.apk` |
| **Privacy policy URL** | Required — especially because the app uses the **microphone** and stores **local accounts** |
| **Data safety form** | Declare account info and progress stored on device; no cloud sync unless you add it |
| **Content rating** | Complete the IARC questionnaire in Play Console |
| **Target audience** | If aimed at children, follow Google **Families** policy and COPPA rules |
| **Store listing** | App icon, screenshots, short + full description, feature graphic |
| **Version code** | Bump `versionCode` in `android/app/build.gradle` for each upload |

**Recommended build command for Play Store:**

```powershell
cd "D:\Test Proect"
npx eas build --platform android --profile production
```

(Requires [EAS CLI](https://docs.expo.dev/build/setup/) and an Expo account — handles signing and `.aab` creation.)

**What you do NOT need from me right now** unless you want cloud login:

- Backend server
- Firebase / Supabase (optional for cross-device sync)
- Payment integration

Current login stores accounts **on the phone only**. That is fine for Play Store, but progress is **lost if the app is uninstalled** unless you add cloud backup later.

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Expo Go SDK mismatch | Update Expo Go from the app store; project uses **Expo SDK 54** |
| App won’t connect | Same Wi‑Fi, disable VPN/firewall, use `--lan` |
| Stale bundle / old UI | Restart with cache clear: `npx expo start -c` |
| Metro port conflict | Accept the alternate port and rescan the QR code |
| Voice / mic not working | Use `npx expo run:android` or `run:ios`; Expo Go may not load speech recognition |
| `ExpoSpeechRecognition` error | Expected in Expo Go — tap answers instead; dev build required for voice |
| **Unable to load script** on Android | Old debug APK without Metro — rebuild (`assembleRelease` or rebuild debug after `debuggableVariants = []` change); use `npx expo start` + `npx expo run:android` for live dev |
| `adb` not recognized | Add `%LOCALAPPDATA%\Android\Sdk\platform-tools` to PATH, or use full path to `adb.exe` |
| `JAVA_HOME is not set` | Set `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"` before `gradlew` |
| Scores or rewards missing | Data is per account on this device; sign in with the same username or reinstalling may clear it |
| Reset everything | Home screen → **↺ Reset all progress** (clears the signed-in account's data) |

## License

Private project (`"private": true` in `package.json`).
