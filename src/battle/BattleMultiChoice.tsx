/**
 * BattleMultiChoice.tsx
 * 
 * 4-Option Multiple Choice Component for Pochi 1v1 Battle Arena.
 * Styled to match Pochi Solo's AnswerSelection and warm café aesthetic:
 * - High-frequency 6-second countdown bar
 * - 4 large 3D tactile option cards with [A], [B], [C], [D] index badges
 * - Instant 1-click submission
 * - Spectator view showing opponent answering state
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Fonts } from '../theme/typography';

export interface BattleMultiChoiceProps {
  /** 4 options (including the correct answer) */
  options: string[];
  /** Maximum timeout in milliseconds (default 6000ms) */
  timeoutMs?: number;
  /** Timestamp when answering phase started */
  startTime?: number;
  /** Callback fired when an option is selected */
  onSubmit: (answer: string) => void;
  /** Callback when the countdown timer expires */
  onTimeout?: () => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** If spectating, opponent name */
  opponentName?: string;
  /** If spectating, selected answer by opponent */
  spectatorSelected?: string | null;
}

export const BattleMultiChoice: React.FC<BattleMultiChoiceProps> = ({
  options,
  timeoutMs = 6000,
  startTime,
  onSubmit,
  onTimeout,
  disabled = false,
  opponentName,
  spectatorSelected,
}) => {
  const isSpectating = Boolean(opponentName);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(timeoutMs);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const startTimestampRef = useRef<number>(startTime || Date.now());
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedOption(null);
    setHasSubmitted(false);
    startTimestampRef.current = startTime || Date.now();
    setTimeRemainingMs(timeoutMs);
  }, [options, startTime, timeoutMs]);

  // High-frequency 60fps countdown timer
  useEffect(() => {
    if (disabled || hasSubmitted) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - startTimestampRef.current;
      const remaining = Math.max(0, timeoutMs - elapsed);
      setTimeRemainingMs(remaining);

      if (remaining <= 0) {
        if (!hasSubmitted) {
          setHasSubmitted(true);
          onTimeout?.();
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [disabled, hasSubmitted, timeoutMs, onTimeout]);

  const handleSelectOption = (option: string) => {
    if (disabled || isSpectating || hasSubmitted) return;

    try {
      Vibration.vibrate(25);
    } catch {}

    setSelectedOption(option);
    setHasSubmitted(true);
    onSubmit(option);
  };

  const progressRatio = Math.max(0, Math.min(1, timeRemainingMs / timeoutMs));
  const secondsRemaining = (timeRemainingMs / 1000).toFixed(1);

  const getTimerBarColor = () => {
    if (progressRatio > 0.5) return Colors.correct;
    if (progressRatio > 0.25) return Colors.gold;
    return Colors.incorrect;
  };

  // Fallback options if none provided
  const displayOptions =
    options && options.length > 0
      ? options
      : ['Option A', 'Option B', 'Option C', 'Option D'];

  return (
    <View style={styles.container}>
      {/* Top Header & 6-Second Timer Bar */}
      <View style={styles.headerRow}>
        <View style={styles.labelCluster}>
          {isSpectating ? (
            <>
              <View style={styles.spectateDot} />
              <Text style={styles.spectateLabel}>
                {opponentName ? `${opponentName.toUpperCase()} CHOOSING...` : 'OPPONENT CHOOSING...'}
              </Text>
            </>
          ) : (
            <Text style={styles.headerLabel}>CHOOSE YOUR ANSWER</Text>
          )}
        </View>
        <View
          style={[
            styles.countdownTag,
            progressRatio < 0.25 && styles.countdownTagUrgent,
          ]}
        >
          <Text
            style={[
              styles.countdownText,
              progressRatio < 0.25 && styles.countdownTextUrgent,
            ]}
          >
            {secondsRemaining}s
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progressRatio * 100}%`,
              backgroundColor: getTimerBarColor(),
            },
          ]}
        />
      </View>

      {/* 4 Multi-Choice Option Cards (2x2 Grid) */}
      <View style={styles.optionsGrid}>
        {displayOptions.slice(0, 4).map((option, idx) => {
          const isSelected =
            selectedOption === option || (isSpectating && spectatorSelected === option);
          const isBtnDisabled = disabled || isSpectating || hasSubmitted;

          return (
            <Pressable
              key={`battle-opt-${idx}`}
              onPress={() => handleSelectOption(option)}
              disabled={isBtnDisabled}
              style={({ pressed }) => [
                styles.optionCard,
                isSelected && styles.optionCardSelected,
                (disabled || isSpectating) && !isSelected && styles.optionCardDisabled,
                pressed && !isBtnDisabled && styles.optionCardPressed,
              ]}
            >
              <View
                style={[
                  styles.badgeIndex,
                  isSelected && styles.badgeIndexSelected,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    isSelected && styles.badgeTextSelected,
                  ]}
                >
                  {String.fromCharCode(65 + idx)}
                </Text>
              </View>

              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
                numberOfLines={2}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
  },
  spectateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gold,
  },
  spectateLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.goldDark,
    letterSpacing: 0.5,
  },
  countdownTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countdownTagUrgent: {
    backgroundColor: Colors.incorrectLight,
    borderColor: Colors.incorrectBorder,
  },
  countdownText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: '900',
    color: Colors.goldDark,
  },
  countdownTextUrgent: {
    color: Colors.incorrect,
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4,
  },
  optionCard: {
    width: '48.5%',
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionCardPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
  },
  optionCardSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderBottomColor: Colors.primaryDark,
  },
  optionCardDisabled: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
    opacity: 0.65,
  },
  badgeIndex: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badgeIndexSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  badgeText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: '900',
    color: Colors.inkMuted,
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontFamily: Fonts.heading,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    lineHeight: 18,
  },
  optionTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
});
