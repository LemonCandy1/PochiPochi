# PochiPochi (ポチポチ) — Rapid Progressive Trivia

> **A high-octane, café-tactile competitive trivia application powered by Expo (React Native), TypeScript, and a Supabase backend. Inspired by Japanese quiz buzzer culture, classic Jeopardy! clue mechanics, and competitive chess Elo rating systems.**

---

## 1. Executive Summary & Core Concept

**PochiPochi** takes traditional trivia and turns it into a test of rapid reading speed, precision knowledge, and calculated risk:
- Clues do not appear all at once; instead, they stream sequentially **letter by letter** in real time.
- Future text remains completely invisible—there is **no ghost text** or pre-revealed placeholder length.
- Players choose between jumping in early for up to a **2.00x Speed Bonus** or waiting for more context at the cost of a diminishing multiplier.
- Every answer dynamically recalibrates both the **Player's Elo** and the **Question's Elo**, creating an adaptive difficulty curve that scales with the player's true skill level.

---

## 2. Core Gameplay Mechanics

### 2.1 Smooth Per-Letter Clue Reveal (`ClueStreamer`)
- **Fluid Stream**: Clues stream character-by-character at a rapid, readable 28ms cadence.
- **Tactile Audio Tick**: A subtle typewriter tick fires every 6 characters to provide a rhythmic, tactile café aesthetic.
- **No Spoilers**: Text ahead of the streaming cursor is entirely hidden.
- **Immediate Pause / Freeze**:
  - Selecting an answer immediately freezes the streamer and reveals the full text.
  - Navigating away from the solo tab immediately pauses the interval and silences all ticks.

### 2.2 Dynamic Speed Bonus (1.00x – 2.00x)
- As letters reveal, the speed bonus decays continuously from **2.00x** down to a floor of **1.00x**:
  $$\text{Multiplier} = 1.0 + 1.0 \times (1.0 - \text{progressRatio})^{1.5}$$
- **Early Guess Reward**: Answering within the first 10%–20% of the clue yields near 2.0x bonus Elo gains.
- **Base Level**: If the clue fully reveals before answering, base scoring (1.00x) applies.

### 2.3 Classic 4-Option Multiple Choice Grid
- Every question presents four multiple-choice options (1 correct answer + 3 authentic distractors).
- Fully interactive while the clue is actively streaming.
- Fast tap response with zero latency or re-render blocking.

### 2.4 Answer Mask & Strategic Letter Clues
- Shows the target answer's structure as clean letter slots (e.g., `[D][E][A][D] [S][E][A]`).
- **Progressive Letter Hints**:
  - At **40%** clue progress: The first letter is automatically revealed if the answer has >3 letters.
  - At **75%** clue progress: The last letter is also revealed.
- **User Preference**: Can be toggled on or off at any time in the in-game **Options Menu**.

### 2.5 Dual-Sided Elo Rating Engine
PochiPochi implements a true Elo rating system calibrated against question difficulty and response speed:
- **Player Elo**: Tracks both an **Overall Elo** and individual **Category Elos** (Science, Geography, Anime, General Knowledge). Default baseline is **1200**.
- **Question Elo**: Every clue maintains its own Elo rating calibrated from historical solve rates and Jeopardy! dollar tiers ($200 = 1000 Elo, $2000 = 1600 Elo).
- **Speed Multiplier Scaling**: Winning quickly scales positive Elo gain by the speed factor. Missed questions deduct standard Elo without speed penalty.

### 2.6 Post-Question Resolution Card
When a question concludes, the screen automatically scrolls to the detailed **Resolution Card**:
- **Outcome Banner**: Distinctive Correct (green) or Missed (red) state.
- **Elo Delta Badge**: Dynamic score change with speed multiplier badge (e.g., `+18 Elo (1.95x Speed)`).
- **Target Answer**: Full unmasked answer in bold typography.
- **Curated Context Summary**: Context explaining why the answer is correct.
- **Wikipedia Deep Link**: One-tap native browser link directly to the relevant Wikipedia entry.
- **Utility Actions**: One-tap **Bookmark / Save to Notebook** and **Flag / Report** modal.
- **Next Question Button**: Instant progression that seamlessly resets the viewport to top `(0, 0)` and mounts the next unique question.

---

## 3. Visual & Sound Design

### 3.1 Color Palette & Styling
- **Canvas Base**: Fair Bianca (`#F8F5EE`–`#F5F0E6`) for background sheets, reading surfaces, and quiz card bodies.
- **Anchor / Text**: Deep Navy (`#0F172A`–`#151E34`) for primary typography, app bars, key outlines, and elevation shadows.
- **Focus / Selection / Primary**: Deep Royal Blue (`#00009F`) for selected option states, progress bar fills, primary CTA buttons, and key interactive focal points.
- **Competitive Accent**: Amber / Burnt Ochre (`#E08722`) for timers under 5s, multiplayer matchmaking badges, and streak counters.
- **Success State**: Muted Emerald (`#2E7D56`) for correct answer reveal and completed solo learning modules.
- **Error State**: Crimson / Brick (`#C24134`) for wrong answer strikes and timeout indicators.
- **Zero Emojis**: Replaced with custom SVG vector icons, official Lucide icons, and mascot illustrations.

### 3.2 Vector Mascot: Pochi the Labrador
- Handcrafted SVG vector mascot that reacts dynamically to game state:
  - **Pensive**: During clue streaming.
  - **Happy**: On correct answer resolution.
  - **Confused**: On missed answer resolution.
- **Audience Pit**: Animated spectator row beneath the card that cheers when questions are solved.

### 3.3 Audio & Haptic Lifecycle Management
- **Typewriter Ticks**: Subtle per-letter ticks during stream.
- **Correct Melodic Chime**: Ascending 2-tone chime (E5 $\rightarrow$ A5) + success haptic pulse.
- **Incorrect Thud**: Soft descending tone (240Hz $\rightarrow$ 180Hz) + error haptic pulse.
- **Zero Background Leakage**: Uses Expo Router's `useFocusEffect` lifecycle hook. Navigating away from Solo to Home, Notebook, or Champions immediately executes `AudioHaptics.stopAll()` and silences all oscillators, timeouts, and haptic feedback.

---

## 4. Trivia Categories & Question Datasets

| Category | Theme Tag | Baseline Difficulty | Primary Source |
| :--- | :--- | :--- | :--- |
| **Geography** | World & Maps | 1000 – 1600 Elo | 1,000+ J! Archive & TriviaQA clues in Supabase |
| **Science** | STEM & Nature | 1100 – 1500 Elo | Bundled J! Archive chemistry, physics, biology |
| **Anime & Manga** | Comics & Lore | 1150 – 1450 Elo | Bundled Shonen, Ghibli, classic mecha trivia |
| **General Knowledge** | History & Arts | 1100 – 1500 Elo | World history, literature, treaties, architecture |

### J! Archive Elo Calibration
Jeopardy! round and dollar values are mapped directly to baseline Elo ratings:
- **Jeopardy! Round**:
  - $200 $\rightarrow$ 1050 Elo
  - $400 $\rightarrow$ 1150 Elo
  - $600 $\rightarrow$ 1250 Elo
  - $800 $\rightarrow$ 1350 Elo
  - $1000 $\rightarrow$ 1450 Elo
- **Double Jeopardy! Round**:
  - $400 $\rightarrow$ 1200 Elo
  - $800 $\rightarrow$ 1300 Elo
  - $1200 $\rightarrow$ 1400 Elo
  - $1600 $\rightarrow$ 1500 Elo
  - $2000 $\rightarrow$ 1600 Elo

---

## 5. Backend Architecture & Database (Supabase)

The app is connected to a dedicated **Supabase PostgreSQL** instance with persistent cloud storage:

### 5.1 Database Schema (`supabase/schema.sql`)
1. **`questions` Table**:
   - `id` (text, primary key)
   - `category` (text: 'science', 'geography', 'anime', 'general')
   - `clue_text` (text)
   - `answer` (text)
   - `answer_mask_length` (integer)
   - `options` (jsonb array of 4 multiple choice choices)
   - `wikipedia_url` (text)
   - `context_summary` (text)
   - `elo_rating` (integer, default 1200)
   - `times_served` / `times_correct` (analytics counters)
2. **`profiles` Table**:
   - `id` (text, primary key)
   - `username` (text)
   - `overall_elo` (integer)
   - `category_elos` (jsonb)
   - `total_played` / `total_correct` (counters)
   - `current_streak` / `best_streak` (counters)
   - `sound_enabled` / `show_letter_count` (boolean preferences)
3. **`bookmarks` Table**:
   - Stores saved questions per user for offline review in the Notebook.
4. **`question_reports` Table**:
   - Community question flagging with categories: inaccurate, typo, wrong options, or broken link.
5. **`player_match_history` Table**:
   - Match log tracking speed multipliers, Elo deltas, and timestamped outcomes.

### 5.2 Seeding & Pre-fetching Strategy
- **1,000+ Geography Clues**: Seeded directly into Supabase via `server/seed_geography_supabase.js`.
- **Random-Offset Prefetching**: When the candidate pool drops below 25 questions, the repository queries Supabase using a random offset spanning the 1,000+ items (`offset: 0..950`), guaranteeing variety with no back-to-back repeats.
- **Session Duplicate Guard**: Tracks both question IDs and normalized clue text (`servedHistory`) to prevent repeat occurrences across play sessions.

---

## 6. Information Architecture & Navigation

The app is built with **Expo Router** using bottom-tab navigation:

```
app/
├── _layout.tsx           # Root layout: font loading, safe areas, status bar
└── (tabs)/
    ├── _layout.tsx       # Bottom tab bar styling & tab definitions
    ├── index.tsx         # Home screen: Daily teaser, category cards, dataset sync
    ├── play.tsx          # Pochi Solo screen: live sequential streamer & options
    ├── notebook.tsx      # Saved questions, filter by category, study review
    └── champions.tsx     # Global & category leaderboards, Elo rank tiers
```

### Screen Breakdown:
1. **Home (`/`)**:
   - Profile summary with overall Elo and avatar.
   - **Daily Speed Teaser**: Timed challenge widget.
   - **All-Mix Endless Mode**: Jump straight into multi-category rapid trivia.
   - **Category Cards**: Category selection with real-time Elo tags.
   - **Open Trivia Datasets Widget**: Cloud sync trigger to pull questions from Supabase.
2. **Pochi Solo (`/play`)**:
   - Top Bar: Category badge, Options/Settings gear, streak counter, Elo badge.
   - Clue Stage: Pochi mascot dialogue, Letter mask slots, Clue streamer.
   - Speed bonus indicator with lightning badge.
   - 4-choice response grid.
   - Resolution card with Wikipedia integration.
3. **Notebook (`/notebook`)**:
   - All questions saved via the bookmark icon.
   - Filter chips: All, Science, Geography, Anime, General.
   - Direct links to Wikipedia for each saved item.
4. **Champions (`/champions`)**:
   - Leaderboards partitioned by Overall, Science, Geography, Anime, and General.
   - Division tier badges: Grandmaster (>1400), Master (1300-1399), Diamond (1200-1299), Gold (1100-1199).
   - User profile rank highlight.

---

## 7. Project Structure

```
PochiPochi/
├── app/                        # Expo Router screen routes
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Bottom tabs configuration
│   │   ├── index.tsx           # Home screen
│   │   ├── play.tsx            # Solo gameplay screen
│   │   ├── notebook.tsx        # Saved questions notebook
│   │   └── champions.tsx       # Leaderboards
│   └── _layout.tsx             # Root layout
├── assets/                     # App icons, splash screens, assets
├── server/                     # Dataset seeding & standalone API utilities
│   ├── jarchive_api_server.js  # Self-hosted trivia REST API
│   └── seed_geography_supabase.js # Bulk 1,000+ question Supabase seeder
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── AnswerMask.tsx       # Letter-count slots
│   │   │   ├── AnswerSelection.tsx  # 4-option response grid
│   │   │   ├── ClueStreamer.tsx     # Sequential per-letter text streamer
│   │   │   ├── PochiBuzzer.tsx      # Legacy buzzer component
│   │   │   └── ResolutionCard.tsx   # Answer reveal & Wikipedia card
│   │   ├── icons/
│   │   │   └── CategoryIcons.tsx    # Custom category & speed icons
│   │   ├── mascot/
│   │   │   └── MascotVectors.tsx    # Pochi Labrador & audience SVGs
│   │   └── modal/
│   │       ├── OptionsMenuModal.tsx # Letter count & sound settings
│   │       └── ReportModal.tsx      # Question flagging dialog
│   ├── data/
│   │   ├── questions.ts        # Built-in initial baseline questions
│   │   └── repository.ts       # Unified data access layer (AsyncStorage + Supabase)
│   ├── engine/
│   │   └── eloEngine.ts        # Dual-sided Elo & speed bonus algorithms
│   ├── services/
│   │   ├── api/
│   │   │   └── triviaApiClient.ts  # J! Archive parsing & external API client
│   │   └── supabase/
│   │       └── supabaseClient.ts   # Supabase DB operations & auth
│   ├── theme/
│   │   └── colors.ts           # Warm café design tokens & shadows
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & types
│   └── utils/
│       └── audioHaptics.ts     # Sound synthesis, haptics & lifecycle control
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL DDL schema
├── .env                        # Supabase URL & public anon keys
├── app.json                    # Expo application configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript strict configuration
```

---

## 8. Setup & Development Guide

### Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **Expo CLI**: bundled with `npx expo`
- **Android Studio / Xcode** (optional for native simulator testing; web runs in browser)

### Installation
```bash
# Clone the repository and enter directory
cd PochiPochi

# Install dependencies
npm install
```

### Environment Configuration
Create or verify the `.env` file in the root directory:
```ini
EXPO_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=<your-anon-key>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Database Initialization
1. In the Supabase SQL Editor, execute the SQL script in [supabase/schema.sql](file:///c:/Users/luisc/Desktop/Project/PochiPochi/supabase/schema.sql).
2. Seed the 1,000+ geography questions:
   ```bash
   node server/seed_geography_supabase.js
   ```

### Running Locally
```bash
# Start Metro bundler
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Run in Web browser
npx expo start --web
```

### Type Checking & Validation
```bash
# Run TypeScript compiler verification
npx tsc --noEmit
```

---

## 9. Key Highlights & Technical Decisions

1. **Deterministic Question Identification**: Bundled clues use stable IDs (`jarchive-bundle-${index}`) to eliminate duplicate storage drift.
2. **Memory Leaks & Render Performance**: `AnswerSelection` is memoized with `React.memo`, and progress events in `ClueStreamer` are throttled to prevent touch responder drops.
3. **Zero Sound Leakage**: Sound synthesis and haptic triggers are silenced instantly on tab transition via `useFocusEffect` and `AudioHaptics.stopAll()`.
4. **Adaptive Pre-fetching**: Supabase queries use randomized offsets across the 1,000+ question table, ensuring players rarely experience repeats.
