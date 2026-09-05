import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface MascotProps {
  size?: number;
  expression?: 'happy' | 'pensive' | 'excited' | 'confused';
  color?: string;
}

/**
 * Smart Labrador Mascot (Pochi) rendered in clean editorial line art
 * faithful to the PochiPochi master character sheet.
 */
export const PochiLabrador: React.FC<MascotProps> = ({
  size = 120,
  expression = 'happy',
  color = Colors.ink,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Head base */}
      <Path
        d="M28 42 C28 26 72 26 72 42 C72 65 62 76 50 76 C38 76 28 65 28 42 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left Droopy Ear */}
      <Path
        d="M28 32 C18 34 14 52 20 64 C23 68 28 66 28 58 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Right Droopy Ear */}
      <Path
        d="M72 32 C82 34 86 52 80 64 C77 68 72 66 72 58 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Eyes based on expression */}
      {expression === 'happy' && (
        <>
          <Circle cx="40" cy="42" r="3.5" fill={color} />
          <Circle cx="60" cy="42" r="3.5" fill={color} />
          <Circle cx="41" cy="40.5" r="1" fill="#FFFFFF" />
          <Circle cx="61" cy="40.5" r="1" fill="#FFFFFF" />
        </>
      )}

      {expression === 'pensive' && (
        <>
          <Circle cx="41" cy="39" r="3.2" fill={color} />
          <Circle cx="61" cy="39" r="3.2" fill={color} />
          {/* Tilted brow */}
          <Path d="M37 34 L45 36" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M57 36 L65 34" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {expression === 'excited' && (
        <>
          {/* Closed happy crescents */}
          <Path d="M36 43 Q40 37 44 43" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M56 43 Q60 37 64 43" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          {/* Cheek blushes */}
          <Ellipse cx="33" cy="48" rx="3" ry="1.5" fill="#FCA5A5" opacity={0.6} />
          <Ellipse cx="67" cy="48" rx="3" ry="1.5" fill="#FCA5A5" opacity={0.6} />
        </>
      )}

      {expression === 'confused' && (
        <>
          <Circle cx="39" cy="42" r="4" fill={color} />
          <Circle cx="61" cy="43" r="2.5" fill={color} />
          <Path d="M36 34 Q40 36 44 34" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M57 37 Q61 35 65 37" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {/* Snout and Nose */}
      <Path
        d="M45 51 C45 48 55 48 55 51 C55 54 45 54 45 51 Z"
        fill={color}
      />
      <Path
        d="M50 53 L50 59 M50 59 Q45 63 42 60 M50 59 Q55 63 58 60"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Collar with signature Pochi button medallion */}
      <Path
        d="M32 72 Q50 78 68 72"
        stroke={Colors.primary}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <Circle
        cx="50"
        cy="78"
        r="4.5"
        fill={Colors.primary}
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
};

/**
 * Wise Owl Professor Mascot with Mortarboard
 */
export const OwlProfessor: React.FC<{ size?: number }> = ({ size = 90 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Mortarboard */}
    <Path d="M50 18 L82 28 L50 38 L18 28 Z" fill={Colors.primary} stroke={Colors.ink} strokeWidth="2" />
    <Rect x="40" y="32" width="20" height="7" fill={Colors.primary} stroke={Colors.ink} strokeWidth="1.5" />
    <Path d="M50 28 L78 40 L78 48" stroke={Colors.gold} strokeWidth="1.5" strokeLinecap="round" />

    {/* Owl Body & Face */}
    <Circle cx="50" cy="62" r="26" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="2.5" />
    {/* Round Glasses */}
    <Circle cx="40" cy="56" r="9" fill="none" stroke={Colors.ink} strokeWidth="2" />
    <Circle cx="60" cy="56" r="9" fill="none" stroke={Colors.ink} strokeWidth="2" />
    <Line x1="49" y1="56" x2="51" y2="56" stroke={Colors.ink} strokeWidth="2" />
    {/* Eyes inside glasses */}
    <Circle cx="40" cy="56" r="3" fill={Colors.ink} />
    <Circle cx="60" cy="56" r="3" fill={Colors.ink} />
    {/* Beak */}
    <Path d="M47 64 L53 64 L50 70 Z" fill={Colors.gold} stroke={Colors.ink} strokeWidth="1.5" />
  </Svg>
);

/**
 * Audience Pit cheering crowd vignette
 */
export const AudienceCrowd: React.FC<{ excited?: boolean }> = ({ excited = false }) => (
  <Svg width="100%" height="45" viewBox="0 0 320 45" fill="none">
    {/* Crowd heads with raised hands */}
    <Circle cx="40" cy="30" r="12" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />
    {/* Cat ears on member 2 */}
    <Path d="M85 18 L90 26 M105 18 L100 26" stroke={Colors.ink} strokeWidth="1.5" />
    <Circle cx="95" cy="30" r="12" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />

    {/* Center Dog head */}
    <Circle cx="160" cy="24" r="14" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.8" />
    <Path d="M148 22 C142 24 140 32 144 38" stroke={Colors.ink} strokeWidth="1.5" />
    <Path d="M172 22 C178 24 180 32 176 38" stroke={Colors.ink} strokeWidth="1.5" />

    <Circle cx="225" cy="30" r="12" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />
    <Circle cx="280" cy="30" r="12" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />

    {/* Cheering hands if excited */}
    {excited ? (
      <>
        <Path d="M22 18 L30 26 M58 18 L50 26" stroke={Colors.ink} strokeWidth="2" strokeLinecap="round" />
        <Path d="M136 12 L146 22 M184 12 L174 22" stroke={Colors.primary} strokeWidth="2.2" strokeLinecap="round" />
        <Path d="M265 18 L272 26 M295 18 L288 26" stroke={Colors.ink} strokeWidth="2" strokeLinecap="round" />
      </>
    ) : (
      <Path d="M140 28 Q160 20 180 28" stroke={Colors.borderDark} strokeWidth="1" strokeDasharray="2,2" />
    )}
  </Svg>
);
