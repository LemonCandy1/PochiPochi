import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, COPY, TIMING } from '../content';
import { FONTS } from '../fonts';
import { Buzzer } from '../components/Buzzer';
import { RevealLines } from '../components/Copy';
import { EASE_IN, keyframes, progress } from '../motion';

/** A clue streams in, the buzzer cuts it off mid-word, and the promise lands. */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const PRESS = 38;
  const exitStart = TIMING.hook - 14;

  const chars = Math.min(COPY.hook.clue.length, Math.floor(f * 1.45));
  const frozen = f >= PRESS + 3;
  const cursorOn = !frozen && Math.floor(f / 8) % 2 === 0;
  const clueDim = progress(f, PRESS + 3, 10);

  const pop = spring({ frame: f - 14, fps, config: { damping: 14, stiffness: 160 } });
  const press = keyframes(f, [
    [PRESS - 3, 0],
    [PRESS + 1, 1],
    [PRESS + 6, 1],
    [PRESS + 14, 0],
  ]);
  const ripple = progress(f, PRESS + 1, 24);
  const exit = progress(f, exitStart, 14, EASE_IN);

  return (
    <AbsoluteFill>
      {/* Streaming clue */}
      <div
        style={{
          position: 'absolute',
          top: 320,
          left: 96,
          right: 96,
          fontFamily: FONTS.body,
          fontWeight: 800,
          fontSize: 66,
          lineHeight: 1.28,
          color: COLORS.ink,
          opacity: (1 - clueDim * 0.8) * (1 - exit),
          transform: `translateY(${-60 * exit}px)`,
        }}
      >
        {COPY.hook.clue.slice(0, chars)}
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 62,
            marginLeft: 6,
            verticalAlign: '-8px',
            background: COLORS.primary,
            opacity: cursorOn ? 1 : 0,
          }}
        />
      </div>

      {/* Headline */}
      <div
        style={{
          position: 'absolute',
          top: 690,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: 1 - exit,
          transform: `translateY(${-60 * exit}px)`,
        }}
      >
        <RevealLines
          lines={[COPY.hook.line1, COPY.hook.line2]}
          lineColors={[COLORS.ink, COLORS.primary]}
          frame={f}
          start={PRESS + 6}
          stagger={6}
          style={{ fontFamily: FONTS.heading, fontWeight: 700, fontSize: 150, lineHeight: 1.05, letterSpacing: -2 }}
        />
      </div>

      {/* Buzzer */}
      <div
        style={{
          position: 'absolute',
          left: 540,
          top: 1420,
          transform: `translate(-50%, -50%) translateY(${exit * 500}px) scale(${pop})`,
          opacity: 1 - exit,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            border: `6px solid ${COLORS.primary}`,
            transform: `translate(-50%, -50%) scale(${1 + ripple * 1.1})`,
            opacity: ripple > 0 ? 0.5 * (1 - ripple) : 0,
          }}
        />
        <Buzzer size={380} press={press} />
      </div>
    </AbsoluteFill>
  );
};
