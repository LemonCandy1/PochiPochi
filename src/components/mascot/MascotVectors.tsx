import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path, Polygon, Rect } from 'react-native-svg';
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
 * Globe-Trotter Bear Mascot (Curious / Geography)
 * Round ears, adventurer pith hat with compass badge.
 */
export const GlobeTrotterBear: React.FC<MascotProps> = ({
  size = 120,
  expression = 'happy',
  color = Colors.ink,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Bear Ears */}
      <Circle cx="26" cy="30" r="10" fill="#FFFFFF" stroke={color} strokeWidth="2.5" />
      <Circle cx="26" cy="30" r="5" fill="#FEE2E2" />
      <Circle cx="74" cy="30" r="10" fill="#FFFFFF" stroke={color} strokeWidth="2.5" />
      <Circle cx="74" cy="30" r="5" fill="#FEE2E2" />

      {/* Head Base */}
      <Path
        d="M24 48 C24 30 76 30 76 48 C76 68 66 78 50 78 C34 78 24 68 24 48 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
      />

      {/* Explorer Hat */}
      <Path
        d="M32 30 C32 20 68 20 68 30 Z"
        fill="#FEF3C7"
        stroke={color}
        strokeWidth="2.2"
      />
      <Ellipse cx="50" cy="30" rx="26" ry="5" fill="#FEF3C7" stroke={color} strokeWidth="2.2" />
      <Path d="M38 29 L62 29" stroke={Colors.primary} strokeWidth="2.5" />

      {/* Eyes based on expression */}
      {expression === 'happy' && (
        <>
          <Circle cx="39" cy="48" r="3.5" fill={color} />
          <Circle cx="61" cy="48" r="3.5" fill={color} />
          <Circle cx="40" cy="46.5" r="1" fill="#FFFFFF" />
          <Circle cx="62" cy="46.5" r="1" fill="#FFFFFF" />
        </>
      )}

      {expression === 'excited' && (
        <>
          <Path d="M35 48 Q39 42 43 48" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M57 48 Q61 42 65 48" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <Ellipse cx="33" cy="53" rx="3" ry="1.5" fill="#FCA5A5" opacity={0.6} />
          <Ellipse cx="67" cy="53" rx="3" ry="1.5" fill="#FCA5A5" opacity={0.6} />
        </>
      )}

      {(expression === 'pensive' || expression === 'confused') && (
        <>
          <Circle cx="39" cy="48" r="3.2" fill={color} />
          <Circle cx="61" cy="48" r="3.2" fill={color} />
          <Path d="M35 44 L43 45" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M57 45 L65 44" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {/* Bear Snout Muzzle */}
      <Ellipse cx="50" cy="59" rx="11" ry="8" fill="#F4EFE6" stroke={color} strokeWidth="1.8" />
      <Ellipse cx="50" cy="55" rx="4.5" ry="3" fill={color} />
      {expression === 'pensive' ? (
        <Line x1="46" y1="62" x2="54" y2="62" stroke={color} strokeWidth="2" strokeLinecap="round" />
      ) : (
        <Path d="M46 60 Q50 64 54 60" stroke={color} strokeWidth="2" strokeLinecap="round" />
      )}

      {/* Explorer Compass Medallion */}
      <Circle cx="50" cy="79" r="5" fill={Colors.gold} stroke={color} strokeWidth="1.5" />
      <Path d="M50 76 L52 79 L50 82 L48 79 Z" fill="#FFFFFF" />
    </Svg>
  );
};

/**
 * Otaku Bunny Mascot (Energetic / Pop Culture & Anime)
 * Tall upright ears, anime blush, star headband.
 */
export const OtakuBunny: React.FC<MascotProps> = ({
  size = 120,
  expression = 'happy',
  color = Colors.ink,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Tall Bunny Ears */}
      <Path
        d="M32 38 C28 12 40 4 42 12 C44 20 40 34 38 38 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <Path d="M34 32 C32 18 38 12 39 16 C40 20 38 28 36 32 Z" fill="#FEE2E2" />

      <Path
        d="M68 38 C72 12 60 4 58 12 C56 20 60 34 62 38 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <Path d="M66 32 C68 18 62 12 61 16 C60 20 62 28 64 32 Z" fill="#FEE2E2" />

      {/* Head Base */}
      <Path
        d="M26 50 C26 34 74 34 74 50 C74 70 64 78 50 78 C36 78 26 70 26 50 Z"
        fill="#FFFFFF"
        stroke={color}
        strokeWidth="2.5"
      />

      {/* Anime Headband */}
      <Path d="M26 44 Q50 40 74 44" stroke={Colors.primary} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="50" cy="42" r="3.5" fill={Colors.gold} stroke={color} strokeWidth="1" />

      {/* Eyes based on expression */}
      {expression === 'happy' && (
        <>
          <Circle cx="38" cy="52" r="3.5" fill={color} />
          <Circle cx="62" cy="52" r="3.5" fill={color} />
          <Circle cx="39" cy="50.5" r="1.2" fill="#FFFFFF" />
          <Circle cx="63" cy="50.5" r="1.2" fill="#FFFFFF" />
        </>
      )}

      {expression === 'excited' && (
        <>
          <Path d="M34 52 Q38 46 42 52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <Path d="M58 52 Q62 46 66 52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}

      {(expression === 'pensive' || expression === 'confused') && (
        <>
          <Circle cx="38" cy="52" r="3" fill={color} />
          <Circle cx="62" cy="52" r="3" fill={color} />
          <Line x1="34" y1="48" x2="42" y2="49" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <Line x1="58" y1="49" x2="66" y2="48" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}

      {/* Bunny Cheeks & Nose */}
      <Ellipse cx="31" cy="56" rx="3.5" ry="2" fill="#FCA5A5" opacity={0.7} />
      <Ellipse cx="69" cy="56" rx="3.5" ry="2" fill="#FCA5A5" opacity={0.7} />
      <Polygon points="50,56 48,58 52,58" fill={color} />
      {expression === 'pensive' ? (
        <Line x1="47" y1="63" x2="53" y2="63" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <Path d="M50 58 L50 61 M50 61 Q46 64 44 62 M50 61 Q54 64 56 62" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      )}
    </Svg>
  );
};

/**
 * Wise Owl Professor Mascot with Mortarboard (Analytical / Science)
 */
export const OwlProfessor: React.FC<MascotProps> = ({
  size = 120,
  expression = 'happy',
  color = Colors.ink,
}) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Mortarboard */}
    <Path d="M50 18 L82 28 L50 38 L18 28 Z" fill={Colors.primary} stroke={color} strokeWidth="2" />
    <Rect x="40" y="32" width="20" height="7" fill={Colors.primary} stroke={color} strokeWidth="1.5" />
    <Path d="M50 28 L78 40 L78 48" stroke={Colors.gold} strokeWidth="1.5" strokeLinecap="round" />

    {/* Owl Body & Face */}
    <Circle cx="50" cy="62" r="26" fill="#FFFFFF" stroke={color} strokeWidth="2.5" />
    {/* Round Glasses */}
    <Circle cx="40" cy="56" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Circle cx="60" cy="56" r="9" fill="none" stroke={color} strokeWidth="2" />
    <Line x1="49" y1="56" x2="51" y2="56" stroke={color} strokeWidth="2" />

    {/* Eyes inside glasses */}
    {expression === 'excited' ? (
      <>
        <Path d="M37 56 Q40 52 43 56" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <Path d="M57 56 Q60 52 63 56" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </>
    ) : expression === 'pensive' ? (
      <>
        <Circle cx="40" cy="56" r="2.8" fill={color} />
        <Circle cx="60" cy="56" r="2.8" fill={color} />
        <Line x1="35" y1="50" x2="44" y2="52" stroke={color} strokeWidth="1.5" />
        <Line x1="56" y1="52" x2="65" y2="50" stroke={color} strokeWidth="1.5" />
      </>
    ) : (
      <>
        <Circle cx="40" cy="56" r="3.2" fill={color} />
        <Circle cx="60" cy="56" r="3.2" fill={color} />
        <Circle cx="41" cy="54.8" r="1" fill="#FFFFFF" />
        <Circle cx="61" cy="54.8" r="1" fill="#FFFFFF" />
      </>
    )}

    {/* Beak */}
    <Path d="M47 64 L53 64 L50 70 Z" fill={Colors.gold} stroke={color} strokeWidth="1.5" />
  </Svg>
);

/**
 * Universal Mascot Companion Selector
 * Renders any of the 4 desk companions with expression & optional trophy badge.
 */
export const MascotCompanion: React.FC<{
  companion: 'dog' | 'bear' | 'bunny' | 'owl';
  size?: number;
  expression?: 'happy' | 'pensive' | 'excited' | 'confused';
  withTrophy?: boolean;
}> = ({
  companion = 'dog',
  size = 120,
  expression = 'happy',
  withTrophy = false,
}) => {
  const renderMascot = () => {
    switch (companion) {
      case 'bear':
        return <GlobeTrotterBear size={size} expression={expression} />;
      case 'bunny':
        return <OtakuBunny size={size} expression={expression} />;
      case 'owl':
        return <OwlProfessor size={size} expression={expression} />;
      case 'dog':
      default:
        return <PochiLabrador size={size} expression={expression} />;
    }
  };

  if (!withTrophy) {
    return renderMascot();
  }

  // With Trophy Ribbon / Badge
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {renderMascot()}
      <View
        style={{
          position: 'absolute',
          bottom: 2,
          right: size * 0.1,
          backgroundColor: Colors.gold,
          paddingHorizontal: 8,
          paddingVertical: 3,
          borderRadius: 8,
          borderWidth: 1.5,
          borderColor: '#FFFFFF',
          shadowColor: Colors.ink,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: 10, color: '#FFFFFF' }}>
          RANK READY
        </Text>
      </View>
    </View>
  );
};

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
      <Path d="M140 28 Q160 20 180 28" stroke={Colors.border} strokeWidth="1" strokeDasharray="2,2" />
    )}
  </Svg>
);
