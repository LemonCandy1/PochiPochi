# PochiPochi promo video

A 23-second vertical (1080×1920, 30fps) product video built with React and Remotion.

```bash
npm install
npm run studio   # live preview + scrubbing
npm run render   # → out/pochipochi-promo.mp4
```

## Storyboard

| # | Scene | Copy | Length |
|---|---|---|---|
| 1 | Hook: a clue types out and the POCHI buzzer cuts it off mid-word | Know it? **Buzz first.** | 3.0s |
| 2 | Intro: phone rises showing Solo mode, the clue streams and the speed bonus decays | Clues reveal letter by letter. / Answer early for up to a 2.0x bonus. | 4.0s |
| 3 | Battle close-up: buzzer pressed, clue pauses, answer spelled, +20 | Buzz in first. Beat your rival. | 4.5s |
| 4 | Lobby close-up: room code card, then "Challenger matched!" | Share a code. Play anywhere. | 3.5s |
| 5 | Wide shot: category Elo pills lift out of the phone as cards | Know your strengths. / Elo for every category. | 4.5s |
| 6 | Close: Pochi, wordmark, tagline, hold | Fun, portable, competitive trivia. | 3.5s |

## Editing

- **Copy, colors, timing, sample data:** `src/content.ts`. `COPY` holds all on-screen text (`\n` = line break). `COLORS` mirrors the app's `src/theme/colors.ts`. `TIMING` sets each scene's length in frames; the total duration and all scene start times follow automatically. `UI` holds the clue, answer, names, room code and category Elos.
- **Camera moves** (phone position, scale, close-ups): the `y` / `scale` keyframes at the top of `src/PhoneStage.tsx`. They're expressed relative to scene starts, so they follow `TIMING`.
- **In-phone screens:** `src/components/Screens.tsx`. These are code recreations of the Solo, Battle, Lobby and Champions screens.
- **Fonts:** `src/fonts.ts` (Fredoka, Nunito, Space Mono, the same fonts as the app).
- **Assets:** the mascot is an SVG port in `src/components/Mascot.tsx`. To use a real logo or screenshots, put the files in `public/` and render them with Remotion's `<Img src={staticFile('logo.png')} />`. For example, put a screenshot inside `<Phone>` in place of a screen component.
