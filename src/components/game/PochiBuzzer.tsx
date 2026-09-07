import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AudioHaptics } from '../../utils/audioHaptics';

interface PochiBuzzerProps {
  onBuzz: () => void;
  disabled?: boolean;
  isBuzzed?: boolean;
}

export const PochiBuzzer: React.FC<PochiBuzzerProps> = ({
  onBuzz,
  disabled = false,
  isBuzzed = false,
}) => {
  const pushAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled || isBuzzed) return;
    Animated.timing(pushAnim, {
      toValue: 6,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pushAnim, {
      toValue: 0,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (disabled || isBuzzed) return;
    AudioHaptics.playPochiBuzzer();
    onBuzz();
  };

  return (
    <View style={styles.outerContainer}>
      {/* 3D Base rim */}
      <View style={styles.basePedestal}>
        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              transform: [{ translateY: pushAnim }],
            },
          ]}
        >
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            disabled={disabled || isBuzzed}
            style={({ pressed }) => [
              styles.buzzerButton,
              (disabled || isBuzzed) && styles.buzzerDisabled,
              pressed && styles.buzzerPressed,
            ]}
          >
            {/* Top inner gradient/shine ring */}
            <View style={styles.innerBevel}>
              <Text style={styles.japaneseText}>BUZZ!</Text>
              <Text style={styles.englishText}>POCHI</Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
      <Text style={styles.buzzerSublabel}>
        {isBuzzed ? 'BUZZED IN! CHOOSE ANSWER' : 'TAP TO FREEZE CLUE & ANSWER'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  basePedestal: {
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 0,
    ...Shadows.buzzer,
  },
  animatedWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  buzzerButton: {
    width: 140,
    height: 136,
    borderRadius: 68,
    backgroundColor: Colors.primary,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buzzerPressed: {
    backgroundColor: Colors.primaryDark,
  },
  buzzerDisabled: {
    backgroundColor: '#94A3B8',
  },
  innerBevel: {
    width: 120,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  japaneseText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  englishText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: '#E0E7FF',
    letterSpacing: 2,
  },
  buzzerSublabel: {
    fontFamily: Fonts.heading,
    marginTop: 10,
    fontSize: 11,
    color: Colors.inkSecondary,
    letterSpacing: 1,
  },
});
