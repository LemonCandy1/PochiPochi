import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, COPY } from '../content';
import { FONTS } from '../fonts';
import { Pochi } from '../components/Mascot';
import { progress } from '../motion';

/** Mascot, wordmark, tagline — then hold. */
export const Close: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mascot = spring({ frame: f - 12, fps, config: { damping: 13, stiffness: 140 } });
  const word = progress(f, 20, 22);
  const kana = progress(f, 30, 18);
  const tag = progress(f, 36, 20);
  const [first, second] = [COPY.close.name.slice(0, 5), COPY.close.name.slice(5)];

  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -60 }}>
        <div style={{ transform: `scale(${mascot}) translateY(${(1 - mascot) * 40}px)` }}>
          <Pochi size={340} expression="excited" />
        </div>
        <div
          style={{
            marginTop: 10,
            fontFamily: FONTS.heading,
            fontWeight: 700,
            fontSize: 168,
            letterSpacing: -3,
            lineHeight: 1,
            opacity: word,
            transform: `translateY(${(1 - word) * 30}px)`,
          }}
        >
          <span style={{ color: COLORS.ink }}>{first}</span>
          <span style={{ color: COLORS.primary }}>{second}</span>
        </div>
        <div
          style={{
            marginTop: 18,
            fontFamily: FONTS.jp,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: 18,
            color: COLORS.inkMuted,
            opacity: kana,
          }}
        >
          {COPY.close.kana}
        </div>
        <div
          style={{
            marginTop: 64,
            width: 120 * tag,
            height: 4,
            borderRadius: 2,
            background: COLORS.gold,
          }}
        />
        <div
          style={{
            marginTop: 40,
            fontFamily: FONTS.body,
            fontWeight: 800,
            fontSize: 48,
            color: COLORS.inkSecondary,
            opacity: tag,
            transform: `translateY(${(1 - tag) * 20}px)`,
          }}
        >
          {COPY.close.tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
