import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect } from 'react-native-svg';
import { Colors } from '../../theme/colors';

interface IconProps {
  size?: number;
  color?: string;
  fill?: string;
}

/**
 * SCIENCE ICON (from Category Master Sheet: Laboratory Microscope & Atom)
 */
export const ScienceCategoryIcon: React.FC<IconProps> = ({
  size = 32,
  color = Colors.ink,
}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Eyepiece and Tube */}
    <Path d="M42 8 L48 14 L34 28 L28 22 Z" fill="#FFFFFF" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    <Line x1="45" y1="11" x2="52" y2="4" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Objective Lens */}
    <Path d="M26 24 L22 28 L27 33 L31 29 Z" fill={color} />
    {/* Stage Plate */}
    <Line x1="12" y1="36" x2="38" y2="36" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <Rect x="20" y="34" width="10" height="2" fill={color} />
    {/* Curved Arm */}
    <Path d="M38 24 C48 24 50 42 42 48" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Focus Knobs */}
    <Circle cx="44" cy="36" r="4" fill="#FFFFFF" stroke={color} strokeWidth="2" />
    {/* Heavy Base */}
    <Path d="M14 56 L50 56 C52 56 54 54 52 50 L48 48 L16 48 L12 50 C10 54 12 56 14 56 Z" fill="#FFFFFF" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    {/* Mirror */}
    <Line x1="20" y1="44" x2="28" y2="41" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </Svg>
);

/**
 * GEOGRAPHY ICON (from Category Master Sheet: Folded World Map with Compass)
 */
export const GeographyCategoryIcon: React.FC<IconProps> = ({
  size = 32,
  color = Colors.ink,
}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Map Folded Panels */}
    <Path d="M8 14 L22 10 L36 15 L50 10 L50 48 L36 53 L22 48 L8 52 Z" fill="#FFFFFF" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    <Line x1="22" y1="10" x2="22" y2="48" stroke={color} strokeWidth="2" strokeDasharray="3,2" />
    <Line x1="36" y1="15" x2="36" y2="53" stroke={color} strokeWidth="2" strokeDasharray="3,2" />
    {/* Simplified Continents on Map */}
    <Path d="M12 20 Q16 24 14 30 Q12 34 18 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M26 18 Q32 20 30 28 Q34 32 28 40" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Path d="M40 18 Q46 22 44 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Mountain Peak Accent */}
    <Polygon points="40,24 46,14 52,24" fill={Colors.primary} stroke={color} strokeWidth="1.5" />
    {/* Compass Rose Badge at bottom left */}
    <Circle cx="16" cy="46" r="10" fill="#FFFFFF" stroke={color} strokeWidth="2.5" />
    <Polygon points="16,39 19,46 16,44 13,46" fill={Colors.primary} />
    <Polygon points="16,53 19,46 16,48 13,46" fill={color} />
  </Svg>
);

/**
 * ANIME & MANGA ICON (from Category Master Sheet: Open Manga Book & Quill + Handheld)
 */
export const AnimeCategoryIcon: React.FC<IconProps> = ({
  size = 32,
  color = Colors.ink,
}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Open Manga Tome Pages */}
    <Path d="M8 44 C18 40 28 41 32 46 C36 41 46 40 56 44 L56 18 C46 14 36 15 32 20 C28 15 18 14 8 18 Z" fill="#FFFFFF" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    <Line x1="32" y1="20" x2="32" y2="46" stroke={color} strokeWidth="2.5" />
    {/* Manga Panel Grids on Left Page */}
    <Rect x="13" y="21" width="7" height="8" stroke={color} strokeWidth="1.5" />
    <Rect x="22" y="21" width="6" height="8" stroke={color} strokeWidth="1.5" />
    <Rect x="13" y="31" width="15" height="7" stroke={color} strokeWidth="1.5" />
    {/* Action lines on Right Page */}
    <Line x1="37" y1="24" x2="51" y2="24" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="37" y1="29" x2="48" y2="29" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <Line x1="37" y1="34" x2="51" y2="34" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    {/* Feather Quill */}
    <Path d="M44 12 Q54 6 56 2 Q52 10 48 18" stroke={Colors.primary} strokeWidth="2.5" strokeLinecap="round" />
    {/* Inkpot */}
    <Rect x="48" y="44" width="8" height="8" rx="2" fill={Colors.primary} stroke={color} strokeWidth="1.5" />
  </Svg>
);

/**
 * GENERAL KNOWLEDGE ICON (from Category Master Sheet: Brain with Question Mark & Books)
 */
export const GeneralKnowledgeCategoryIcon: React.FC<IconProps> = ({
  size = 32,
  color = Colors.ink,
}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    {/* Brain Gyri and Sulci */}
    <Path
      d="M20 34 C14 34 12 26 18 20 C16 14 24 10 30 14 C34 10 44 10 46 16 C52 14 56 22 52 28 C56 34 50 42 42 42 C38 42 36 39 34 39 C32 39 30 42 26 42 C20 42 16 38 20 34 Z"
      fill="#FFFFFF"
      stroke={color}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Inner Brain convolutions */}
    <Path d="M22 24 C26 24 28 28 26 32" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M38 18 C36 24 42 26 40 34" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M32 20 Q32 30 36 34" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Pedestal Book Stack underneath */}
    <Path d="M14 46 L50 46 L48 52 L12 52 Z" fill="#FFFFFF" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <Path d="M10 52 L54 52 L52 58 L8 58 Z" fill="#FFFFFF" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    {/* Question Mark Accent */}
    <Path d="M48 8 Q52 4 56 8 Q56 12 52 14 L52 17" stroke={Colors.primary} strokeWidth="2.5" strokeLinecap="round" />
    <Circle cx="52" cy="20" r="1.2" fill={Colors.primary} />
  </Svg>
);

/**
 * RANK TIER ICONS (replacing all emojis)
 */

// Grandmaster Owl Icon
export const RankGrandmasterOwlIcon: React.FC<IconProps> = ({
  size = 24,
  color = Colors.primary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Mortarboard */}
    <Polygon points="16,4 28,9 16,14 4,9" fill={color} stroke={Colors.ink} strokeWidth="1.5" />
    <Circle cx="16" cy="21" r="9" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />
    {/* Glasses */}
    <Circle cx="12.5" cy="19.5" r="3.2" stroke={Colors.ink} strokeWidth="1.2" />
    <Circle cx="19.5" cy="19.5" r="3.2" stroke={Colors.ink} strokeWidth="1.2" />
    <Circle cx="12.5" cy="19.5" r="1" fill={Colors.ink} />
    <Circle cx="19.5" cy="19.5" r="1" fill={Colors.ink} />
    {/* Beak */}
    <Polygon points="15,23 17,23 16,25.5" fill={Colors.gold} stroke={Colors.ink} strokeWidth="0.8" />
  </Svg>
);

// Trivia Master Cat Icon
export const RankMasterCatIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#7C3AED',
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Head with pointy ears */}
    <Path d="M7 11 L10 18 C8 24 12 28 16 28 C20 28 24 24 22 18 L25 11 L19 14 C17 13 15 13 13 14 Z" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" strokeLinejoin="round" />
    {/* Headphones band */}
    <Path d="M6 17 C6 9 26 9 26 17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Rect x="4" y="15" width="4" height="7" rx="2" fill={color} stroke={Colors.ink} strokeWidth="1" />
    <Rect x="24" y="15" width="4" height="7" rx="2" fill={color} stroke={Colors.ink} strokeWidth="1" />
    {/* Eyes & Whisker marks */}
    <Circle cx="12.5" cy="20" r="1.5" fill={Colors.ink} />
    <Circle cx="19.5" cy="20" r="1.5" fill={Colors.ink} />
    <Line x1="16" y1="22" x2="16" y2="24" stroke={Colors.ink} strokeWidth="1" />
  </Svg>
);

// Scholar Bear Icon
export const RankScholarBearIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#059669',
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Round Ears */}
    <Circle cx="8" cy="10" r="4.5" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />
    <Circle cx="24" cy="10" r="4.5" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />
    {/* Face */}
    <Circle cx="16" cy="18" r="10" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />
    {/* Snout */}
    <Ellipse cx="16" cy="20" rx="4.5" ry="3.5" fill="#F3F4F6" stroke={Colors.ink} strokeWidth="1" />
    <Circle cx="16" cy="19" r="1.5" fill={Colors.ink} />
    {/* Eyes */}
    <Circle cx="12.5" cy="15.5" r="1.5" fill={Colors.ink} />
    <Circle cx="19.5" cy="15.5" r="1.5" fill={Colors.ink} />
    {/* Little tie collar */}
    <Polygon points="16,24 14,27 18,27" fill={color} stroke={Colors.ink} strokeWidth="0.8" />
  </Svg>
);

// Smart Pup Icon
export const RankSmartPupIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#D97706',
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Head */}
    <Path d="M10 12 C10 6 22 6 22 12 C22 22 19 26 16 26 C13 26 10 22 10 12 Z" fill="#FFFFFF" stroke={Colors.ink} strokeWidth="1.5" />
    {/* Droopy ears */}
    <Path d="M10 10 C6 12 5 18 7 22" stroke={Colors.ink} strokeWidth="2" strokeLinecap="round" />
    <Path d="M22 10 C26 12 27 18 25 22" stroke={Colors.ink} strokeWidth="2" strokeLinecap="round" />
    {/* Eyes & Nose */}
    <Circle cx="13" cy="14" r="1.5" fill={Colors.ink} />
    <Circle cx="19" cy="14" r="1.5" fill={Colors.ink} />
    <Polygon points="16,17 14.5,19 17.5,19" fill={color} />
  </Svg>
);

// Curious Novice Paw Icon
export const RankCuriousNoviceIcon: React.FC<IconProps> = ({
  size = 24,
  color = '#64748B',
}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    {/* Main Paw Pad */}
    <Ellipse cx="16" cy="20" rx="6" ry="4.5" fill={color} stroke={Colors.ink} strokeWidth="1.5" />
    {/* 4 Toe Pads */}
    <Circle cx="10" cy="13" r="2.2" fill={color} stroke={Colors.ink} strokeWidth="1" />
    <Circle cx="14" cy="10" r="2.4" fill={color} stroke={Colors.ink} strokeWidth="1" />
    <Circle cx="18" cy="10" r="2.4" fill={color} stroke={Colors.ink} strokeWidth="1" />
    <Circle cx="22" cy="13" r="2.2" fill={color} stroke={Colors.ink} strokeWidth="1" />
  </Svg>
);

/**
 * SPEED LIGHTNING BOLT ICON (Replacing ⚡ emoji)
 */
export const SpeedLightningIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#D97706',
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Polygon points="9,1 2,9 8,9 7,15 14,7 8,7" fill={color} stroke={Colors.ink} strokeWidth="1" strokeLinejoin="round" />
  </Svg>
);

/**
 * FIRE STREAK FLAME ICON (Replacing 🔥 emoji)
 */
export const StreakFlameIcon: React.FC<IconProps> = ({
  size = 14,
  color = '#EF4444',
}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1 C8 1 11 4 11 7 C11 9 12 10 13 10 C13 13 11 15 8 15 C5 15 3 13 3 10 C3 6 7 4 7 4 C7 4 6 7 8 8 C9 9 9 7 8 1 Z"
      fill={color}
      stroke={Colors.ink}
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Helper to render the appropriate Rank Badge Icon based on badgeId
 */
export const RankBadgeIcon: React.FC<{
  badgeId?: 'owl' | 'cat' | 'bear' | 'pup' | 'novice';
  size?: number;
}> = ({ badgeId = 'novice', size = 20 }) => {
  switch (badgeId) {
    case 'owl':
      return <RankGrandmasterOwlIcon size={size} />;
    case 'cat':
      return <RankMasterCatIcon size={size} />;
    case 'bear':
      return <RankScholarBearIcon size={size} />;
    case 'pup':
      return <RankSmartPupIcon size={size} />;
    case 'novice':
    default:
      return <RankCuriousNoviceIcon size={size} />;
  }
};

