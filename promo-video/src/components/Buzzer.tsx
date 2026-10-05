import React from 'react';
import { COLORS } from '../content';
import { FONTS } from '../fonts';

/**
 * The POCHI buzzer from src/components/game/PochiBuzzer.tsx.
 * `press` 0→1 pushes the cap into its pedestal; `dim` greys it out once used.
 */
export const Buzzer: React.FC<{ size: number; press?: number; dim?: boolean }> = ({
  size,
  press = 0,
  dim = false,
}) => {
  const travel = size * 0.05;
  const cap = dim ? '#94A3B8' : press > 0.5 ? COLORS.primaryDark : COLORS.primary;
  return (
    <div
      style={{
        width: size * 1.04,
        height: size * 1.04,
        borderRadius: '50%',
        background: dim ? '#64748B' : COLORS.primaryDark,
        boxShadow: dim
          ? 'none'
          : `0 ${size * 0.07 * (1 - press * 0.6)}px ${size * 0.14}px rgba(0,0,117,0.32)`,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: size,
          height: size * 0.97,
          borderRadius: '50%',
          background: cap,
          transform: `translateY(${press * travel}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: size * 0.86,
            height: size * 0.83,
            borderRadius: '50%',
            border: `${Math.max(2, size * 0.014)}px solid rgba(255,255,255,0.45)`,
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONTS.heading,
            fontWeight: 700,
            color: '#FFF',
          }}
        >
          <div style={{ fontSize: size * 0.157, letterSpacing: size * 0.01, lineHeight: 1.1 }}>BUZZ!</div>
          <div style={{ fontSize: size * 0.1, letterSpacing: size * 0.014, color: '#E0E7FF' }}>POCHI</div>
        </div>
      </div>
    </div>
  );
};
