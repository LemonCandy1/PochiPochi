import React from 'react';
import { COLORS } from '../content';

type Expression = 'happy' | 'pensive' | 'excited';

/** Pochi the Labrador — ported from src/components/mascot/MascotVectors.tsx */
export const Pochi: React.FC<{ size?: number; expression?: Expression }> = ({
  size = 120,
  expression = 'happy',
}) => {
  const c = COLORS.ink;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <path d="M28 42 C28 26 72 26 72 42 C72 65 62 76 50 76 C38 76 28 65 28 42 Z" fill="#FFF" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28 32 C18 34 14 52 20 64 C23 68 28 66 28 58 Z" fill="#FFF" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M72 32 C82 34 86 52 80 64 C77 68 72 66 72 58 Z" fill="#FFF" stroke={c} strokeWidth="2.5" strokeLinejoin="round" />
      {expression === 'happy' && (
        <>
          <circle cx="40" cy="42" r="3.5" fill={c} />
          <circle cx="60" cy="42" r="3.5" fill={c} />
          <circle cx="41" cy="40.5" r="1" fill="#FFF" />
          <circle cx="61" cy="40.5" r="1" fill="#FFF" />
        </>
      )}
      {expression === 'pensive' && (
        <>
          <circle cx="41" cy="39" r="3.2" fill={c} />
          <circle cx="61" cy="39" r="3.2" fill={c} />
          <path d="M37 34 L45 36" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M57 36 L65 34" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
      {expression === 'excited' && (
        <>
          <path d="M36 43 Q40 37 44 43" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M56 43 Q60 37 64 43" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="33" cy="48" rx="3" ry="1.5" fill="#FCA5A5" opacity={0.6} />
          <ellipse cx="67" cy="48" rx="3" ry="1.5" fill="#FCA5A5" opacity={0.6} />
        </>
      )}
      <path d="M45 51 C45 48 55 48 55 51 C55 54 45 54 45 51 Z" fill={c} />
      <path d="M50 53 L50 59 M50 59 Q45 63 42 60 M50 59 Q55 63 58 60" stroke={c} strokeWidth="2" strokeLinecap="round" />
      <path d="M32 72 Q50 78 68 72" stroke={COLORS.primary} strokeWidth="5" strokeLinecap="round" />
      <circle cx="50" cy="78" r="4.5" fill={COLORS.primary} stroke={c} strokeWidth="1.5" />
    </svg>
  );
};
