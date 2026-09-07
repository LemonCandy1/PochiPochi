import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { AudioHaptics } from '../../utils/audioHaptics';

interface ClueStreamerProps {
  fullText: string;
  isStreaming: boolean;
  isFrozen: boolean;
  isPaused?: boolean;
  onProgressUpdate?: (ratio: number) => void;
  onStreamComplete?: () => void;
}

/**
 * Smooth Per-Letter Clue Streamer
 * Sequentially streams the question letter by letter with fluid cadence.
 * Future characters are completely hidden with no ghost text or placeholders.
 * Adds rhythmic breathing pulsation while the question is active.
 */
export const ClueStreamer: React.FC<ClueStreamerProps> = ({
  fullText,
  isStreaming,
  isFrozen,
  isPaused = false,
  onProgressUpdate,
  onStreamComplete,
}) => {
  const [revealedChars, setRevealedChars] = useState<number>(1);
  const timerRef = useRef<any>(null);
  const lastReportedRatio = useRef<number>(0);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;
  const onStreamCompleteRef = useRef(onStreamComplete);
  onStreamCompleteRef.current = onStreamComplete;

  // Pulsation animation during active question streaming
  useEffect(() => {
    if (isStreaming && !isFrozen && !isPaused) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => {
        pulseLoop.stop();
      };
    } else {
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isStreaming, isFrozen, isPaused]);

  // Reset to first character when question text changes
  useEffect(() => {
    setRevealedChars(1);
    lastReportedRatio.current = 0;
    if (fullText.length > 0) {
      const initialRatio = 1 / fullText.length;
      lastReportedRatio.current = initialRatio;
      onProgressUpdateRef.current?.(initialRatio);
    }
  }, [fullText]);

  // Smooth per-letter interval ticker
  useEffect(() => {
    if (!isStreaming || isFrozen || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 28ms cadence for a rapid, fluid reading experience per letter
    timerRef.current = setInterval(() => {
      setRevealedChars((prev) => {
        if (prev >= fullText.length) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev;
        }
        const next = prev + 1;
        // Subtle audio tick every 6 letters for tactile café aesthetic
        if (next % 6 === 0) {
          AudioHaptics.playTypewriterTick();
        }
        return next;
      });
    }, 28);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fullText.length, isStreaming, isFrozen, isPaused]);

  // Notify parent component on progress update with throttled ratio changes
  useEffect(() => {
    if (fullText.length > 0) {
      const ratio = Math.min(1, revealedChars / fullText.length);
      const diff = Math.abs(ratio - lastReportedRatio.current);
      const isComplete = revealedChars >= fullText.length;

      if (diff >= 0.04 || isComplete) {
        lastReportedRatio.current = ratio;
        onProgressUpdateRef.current?.(ratio);
      }

      if (isComplete && isStreaming && !isFrozen) {
        onStreamCompleteRef.current?.();
      }
    }
  }, [revealedChars, fullText.length, isStreaming, isFrozen]);

  // When frozen/resolved, display full text. When streaming, display only letters revealed so far.
  const visibleText = isFrozen ? fullText : fullText.slice(0, revealedChars);

  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.02],
  });

  const auraOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  const auraScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.0, 1.035],
  });

  return (
    <View style={styles.wrapper}>
      {/* Dynamic Pulsating Glow Aura */}
      <Animated.View
        style={[
          styles.pulsingAura,
          {
            opacity: isStreaming && !isFrozen ? auraOpacity : 0,
            transform: [{ scale: isStreaming && !isFrozen ? auraScale : 1.0 }],
          },
        ]}
      />
      {/* Main Question Card with Gentle Rhythmic Breathing */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: isStreaming && !isFrozen ? scale : 1.0 }],
          },
        ]}
      >
        <Text style={styles.clueText}>
          <Text style={styles.visiblePart}>{visibleText}</Text>
          {isStreaming && !isFrozen && !isPaused && revealedChars < fullText.length && (
            <Text style={styles.cursor}> ▌</Text>
          )}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: '100%',
  },
  pulsingAura: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(224, 135, 34, 0.12)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(224, 135, 34, 0.45)',
  },
  container: {
    minHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  clueText: {
    fontFamily: Fonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: Colors.ink,
  },
  visiblePart: {
    fontFamily: Fonts.body,
    color: Colors.ink,
  },
  cursor: {
    fontFamily: Fonts.heading,
    color: Colors.primary,
  },
});
