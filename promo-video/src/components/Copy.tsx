import React from 'react';
import { COLORS } from '../content';
import { FONTS } from '../fonts';
import { EASE_IN, progress } from '../motion';

/** Line-by-line masked text reveal. */
export const RevealLines: React.FC<{
  lines: string[];
  frame: number;
  start: number;
  stagger?: number;
  style: React.CSSProperties;
  lineColors?: string[];
}> = ({ lines, frame, start, stagger = 5, style, lineColors }) => (
  <div>
    {lines.map((line, i) => {
      const p = progress(frame, start + i * stagger, 18);
      return (
        <div key={i} style={{ overflow: 'hidden', paddingBottom: '0.1em', marginBottom: '-0.1em' }}>
          <div
            style={{
              ...style,
              color: lineColors?.[i] ?? style.color,
              transform: `translateY(${(1 - p) * 105}%)`,
              opacity: Math.min(1, p * 1.6),
            }}
          >
            {line}
          </div>
        </div>
      );
    })}
  </div>
);

/** Scene copy: eyebrow label, headline, optional supporting line — centered in the top band. */
export const CopyBlock: React.FC<{
  frame: number;
  duration: number;
  eyebrow: string;
  headline: string;
  sub?: string;
  enterAt?: number;
  brandEyebrow?: boolean;
}> = ({ frame, duration, eyebrow, headline, sub, enterAt = 4, brandEyebrow = false }) => {
  const exit = progress(frame, duration - 10, 10, EASE_IN);
  const lines = headline.split('\n');
  const eyebrowP = progress(frame, enterAt, 16);
  const subP = progress(frame, enterAt + 8 + lines.length * 5, 18);
  return (
    <div
      style={{
        position: 'absolute',
        top: 150,
        left: 60,
        right: 60,
        textAlign: 'center',
        opacity: 1 - exit,
        transform: `translateY(${-40 * exit}px)`,
      }}
    >
      <div
        style={{
          opacity: eyebrowP,
          transform: `translateY(${(1 - eyebrowP) * 16}px)`,
          marginBottom: 24,
          ...(brandEyebrow
            ? { fontFamily: FONTS.heading, fontWeight: 700, fontSize: 48, color: COLORS.primary }
            : { fontFamily: FONTS.mono, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: COLORS.primary }),
        }}
      >
        {eyebrow}
      </div>
      <RevealLines
        lines={lines}
        frame={frame}
        start={enterAt + 4}
        style={{
          fontFamily: FONTS.heading,
          fontWeight: 700,
          fontSize: 96,
          lineHeight: 1.04,
          letterSpacing: -1,
          color: COLORS.ink,
        }}
      />
      {sub && (
        <div
          style={{
            marginTop: 28,
            fontFamily: FONTS.body,
            fontWeight: 700,
            fontSize: 40,
            color: COLORS.inkMuted,
            opacity: subP,
            transform: `translateY(${(1 - subP) * 16}px)`,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};
