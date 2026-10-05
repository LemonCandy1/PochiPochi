/**
 * One persistent phone that travels through scenes 2–5.
 * Camera keyframes (position / scale) frame a full view, close-ups, and a wide shot;
 * the screen content cross-fades between app screens underneath.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, UI } from './content';
import { FONTS } from './fonts';
import { EASE_OUT, keyframes, progress } from './motion';
import { PHONE_H, PHONE_W, Phone, SCREEN_H, SCREEN_W } from './components/Phone';
import { BattleScreen, CATEGORY_PILL_CENTERS, LobbyScreen, SoloScreen, StandingsScreen } from './components/Screens';
import { START as S } from './timeline';

const FADE = 10;

/** Where the elevated category cards land during the Elo scene. */
const CARD_W = 430;
const CARD_H = 200;
const CARD_TARGETS = [
  { x: 310, y: 790 },
  { x: 770, y: 790 },
  { x: 310, y: 1020 },
  { x: 770, y: 1020 },
];

export const PhoneStage: React.FC = () => {
  const f = useCurrentFrame();

  // ---- Camera -------------------------------------------------------------
  const y = keyframes(f, [
    [S.hook + 66, 2700],
    [S.intro + 20, 1250],
    [S.buzz + 4, 1250],
    [S.buzz + 34, 1283],
    [S.room, 1283],
    [S.room + 26, 1502],
    [S.elo - 2, 1502],
    [S.elo + 26, 1080],
    [S.close, 1080],
    [S.close + 26, 2800],
  ]);
  const scale = keyframes(f, [
    [S.intro + 20, 1.2],
    [S.buzz + 4, 1.2],
    [S.buzz + 34, 1.7],
    [S.room, 1.7],
    [S.room + 26, 2.1],
    [S.elo - 2, 2.1],
    [S.elo + 26, 1.1],
  ]);
  if (f < S.hook + 60 || f > S.close + 30) return null;

  // ---- Screen state -------------------------------------------------------
  const soloChars = Math.max(0, (f - S.intro - 4) * 0.7);

  const pressAt = S.buzz + 64;
  const battleChars = Math.min(Math.max(0, (f - S.buzz - 4) * 1.6), (pressAt - S.buzz - 4) * 1.6);
  const press = keyframes(f, [
    [pressAt - 4, 0],
    [pressAt, 1],
    [pressAt + 8, 1],
    [pressAt + 16, 0],
  ]);
  const buzzed = f >= pressAt;
  const typed = Math.max(0, Math.floor((f - pressAt - 14) / 2.2));
  const resolved = typed >= UI.answer.length;
  const resolveAt = pressAt + 14 + UI.answer.length * 2.2;
  const scoreFlash = resolved ? 1 - progress(f, resolveAt + 4, 16) : 0;

  const copied = f >= S.room + 40;
  const matched = f >= S.room + 68;

  // Elo scene: pills lift out of the phone into large cards in front of it
  const lift = (i: number) => progress(f, S.elo + 24 + i * 5, 24);
  const wash = progress(f, S.elo + 22, 20) * (1 - progress(f, S.close, 14));

  const w = (start: number, end: number) => {
    const a = progress(f, start, FADE, EASE_OUT);
    const b = 1 - progress(f, end, FADE, EASE_OUT);
    return Math.min(a, b);
  };
  const screens: [number, React.ReactNode][] = [
    [f < S.buzz + 2 ? 1 : 1 - progress(f, S.buzz + 2, FADE), <SoloScreen chars={soloChars} />],
    [w(S.buzz + 2, S.room + 2), <BattleScreen chars={battleChars} press={press} buzzed={buzzed} typed={Math.min(typed, UI.answer.length)} resolved={resolved} scoreFlash={scoreFlash} />],
    [w(S.room + 2, S.elo + 2), <LobbyScreen copied={copied} matched={matched} />],
    [progress(f, S.elo + 2, FADE), <StandingsScreen hidePills={lift(0) > 0 ? 1 : 0} />],
  ];

  const phoneX = 540;
  const toComp = (sx: number, sy: number) => ({
    x: phoneX + (sx - SCREEN_W / 2) * scale,
    y: y + (sy - SCREEN_H / 2) * scale,
  });

  const closeExit = progress(f, S.close, 22);

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: phoneX - PHONE_W / 2,
            top: y - PHONE_H / 2,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          <Phone>
            {screens.map(([opacity, node], i) =>
              opacity > 0.001 ? (
                <div key={i} style={{ position: 'absolute', inset: 0, opacity }}>
                  {node}
                </div>
              ) : null,
            )}
            <div style={{ position: 'absolute', inset: 0, background: COLORS.background, opacity: wash * 0.6 }} />
          </Phone>
        </div>
      </AbsoluteFill>

      {/* Elevated category cards */}
      {f >= S.elo + 24 &&
        UI.categoryElos.map((c, i) => {
          const p = lift(i);
          const from = toComp(CATEGORY_PILL_CENTERS[i].x, CATEGORY_PILL_CENTERS[i].y);
          const to = CARD_TARGETS[i];
          const cx = from.x + (to.x - from.x) * p;
          const cy = from.y + (to.y - from.y) * p + closeExit * 900;
          const startScale = (198 * scale) / CARD_W;
          const s = startScale + (1 - startScale) * p;
          const bar = progress(f, S.elo + 44 + i * 5, 26);
          const tagP = progress(f, S.elo + 58 + i * 4, 16);
          const isStrength = c.tag === 'STRENGTH';
          const accent = isStrength ? COLORS.correct : c.tag ? COLORS.incorrect : COLORS.primary;
          return (
            <div
              key={c.key}
              style={{
                position: 'absolute',
                left: cx - CARD_W / 2,
                top: cy - CARD_H / 2,
                width: CARD_W,
                height: CARD_H,
                transform: `scale(${s})`,
                borderRadius: 30,
                background: COLORS.card,
                border: `3px solid ${c.tag ? accent : COLORS.ink}`,
                boxShadow: `0 ${30 * p}px ${60 * p}px -20px rgba(15,23,42,${0.28 * p})`,
                padding: '26px 30px',
                boxSizing: 'border-box',
                opacity: 1 - closeExit,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: COLORS.inkMuted }}>
                  {c.key}
                </div>
                {c.tag && (
                  <div
                    style={{
                      fontFamily: FONTS.body,
                      fontWeight: 800,
                      fontSize: 18,
                      letterSpacing: 1.5,
                      color: accent,
                      background: isStrength ? COLORS.correctLight : COLORS.incorrectLight,
                      padding: '6px 12px',
                      borderRadius: 10,
                      opacity: tagP,
                      transform: `scale(${0.8 + 0.2 * tagP})`,
                    }}
                  >
                    {c.tag}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                <span style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 76, color: COLORS.ink, lineHeight: 1.05 }}>
                  {c.value}
                </span>
                <span style={{ fontFamily: FONTS.mono, fontWeight: 700, fontSize: 22, color: COLORS.inkMuted }}>ELO</span>
              </div>
              <div style={{ marginTop: 10, height: 12, borderRadius: 6, background: COLORS.backgroundSecondary, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${((c.value - 1000) / 600) * 100 * bar}%`,
                    height: '100%',
                    borderRadius: 6,
                    background: accent,
                  }}
                />
              </div>
            </div>
          );
        })}
    </AbsoluteFill>
  );
};
