/**
 * BattleDynamicTyping.tsx
 * 
 * Minhaya-Style Dynamic Sequential Typing Component.
 * Styled with Pochi Solo's warm café tactile aesthetic (#F8F5EE, #FFFFFF, tactile push bevels).
 * 
 * Mechanics:
 * - 6 different letter buttons at any time (1 correct next letter + 5 distinct distractors, shuffled).
 * - Sequential typing: With each correct letter, the 6 buttons dynamically change for the next letter.
 * - 2-second timer per letter: Countdown resets to 2000ms immediately on every correct letter press.
 * - Max 8 letters typed: Once 8 correct letters are typed, any remaining letters automatically autocomplete
 *   and the answer is awarded as correct.
 * - Incorrect guess lockout: Pressing an incorrect letter immediately greys out the user, plays an error sound,
 *   displays an "Incorrect Guess" message, and locks them out for the rest of the round.
 * - Spectator view: Displays opponent's live typed letters in real-time.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { FlaticonIcon } from '../components/icons/FlaticonIcon';
import { Colors, Shadows } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { AudioHaptics } from '../utils/audioHaptics';
import {
  cleanAnswerString,
  generateDynamicLetterChoices,
  MAX_DYNAMIC_LETTERS,
} from './matrixGenerator';

export interface BattleDynamicTypingProps {
  /** Target answer string, e.g. "GOLD", "PENICILLIN", "MITOCHONDRIA" */
  targetAnswer: string;
  /** Fallback target slots count if targetAnswer string is not yet resolved */
  targetSlots?: number;
  /** Maximum letters required before autocomplete (default: 8) */
  maxLettersRequired?: number;
  /** Countdown time in milliseconds per individual letter (default: 2000ms) */
  letterTimeoutMs?: number;
  /** Callback when full answer is completed or autocompleted */
  onSubmit: (answer: string) => void;
  /** Callback for real-time keystroke streaming to opponents */
  onKeystroke?: (currentSlots: string[]) => void;
  /** Callback when letter timer expires */
  onTimeout?: () => void;
  /** Callback when user fails/guesses wrong letter */
  onFail?: () => void;
  /** Whether the keypad is disabled */
  disabled?: boolean;
  /** If spectating, display the opponent's live typed letters */
  spectatorInput?: string[];
  /** Optional opponent name when spectating */
  opponentName?: string;
  /** If the active buzzer is known to be locked out */
  isLockedOutExternal?: boolean;
}

export const BattleDynamicTyping: React.FC<BattleDynamicTypingProps> = ({
  targetAnswer,
  targetSlots = 0,
  maxLettersRequired = MAX_DYNAMIC_LETTERS,
  letterTimeoutMs = 2000,
  onSubmit,
  onKeystroke,
  onTimeout,
  onFail,
  disabled = false,
  spectatorInput,
  opponentName,
  isLockedOutExternal = false,
}) => {
  const isSpectating = spectatorInput !== undefined;

  // Clean answer string (e.g. "PENICILLIN")
  const cleanTarget = cleanAnswerString(targetAnswer || '');
  const totalSlots = cleanTarget.length || targetSlots || 4;
  const maxRequired = Math.min(totalSlots, maxLettersRequired);

  // State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [typedLetters, setTypedLetters] = useState<string[]>([]);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(letterTimeoutMs);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(isLockedOutExternal);
  const [lockoutReason, setLockoutReason] = useState<string | null>(null);
  const [wrongPressedLetter, setWrongPressedLetter] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasAutocompleted, setHasAutocompleted] = useState<boolean>(false);

  // Animation frame & timer refs
  const letterStartRef = useRef<number>(Date.now());
  const animFrameRef = useRef<number | null>(null);
  const hasSubmittedRef = useRef<boolean>(false);
  const hasPlayedCorrectRef = useRef<boolean>(false);

  // Helper to generate the 6 dynamic choices for a given position
  const getChoicesForIndex = useCallback(
    (index: number): string[] => {
      if (!cleanTarget || index >= cleanTarget.length) {
        return generateDynamicLetterChoices('A', 6);
      }
      return generateDynamicLetterChoices(cleanTarget[index], 6);
    },
    [cleanTarget]
  );

  // Initialize or reset on targetAnswer / mount
  useEffect(() => {
    setCurrentIndex(0);
    setTypedLetters([]);
    setIsLockedOut(isLockedOutExternal);
    setLockoutReason(null);
    setWrongPressedLetter(null);
    setIsCompleted(false);
    setHasAutocompleted(false);
    hasSubmittedRef.current = false;
    hasPlayedCorrectRef.current = false;
    letterStartRef.current = Date.now();
    setTimeRemainingMs(letterTimeoutMs);

    const initialChoices = getChoicesForIndex(0);
    setCurrentChoices(initialChoices);
  }, [cleanTarget, letterTimeoutMs, isLockedOutExternal, getChoicesForIndex]);

  // High-frequency 60fps 2-second countdown per letter
  useEffect(() => {
    if (disabled || isSpectating || isLockedOut || isCompleted) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = () => {
      const elapsed = Date.now() - letterStartRef.current;
      const remaining = Math.max(0, letterTimeoutMs - elapsed);
      setTimeRemainingMs(remaining);

      if (remaining <= 0) {
        if (!hasSubmittedRef.current) {
          hasSubmittedRef.current = true;
          setIsLockedOut(true);
          setLockoutReason('Incorrect Guess (Time Expired)');
          AudioHaptics.playIncorrect();
          try {
            Vibration.vibrate(60);
          } catch {}

          const partial = typedLetters.join('');
          onSubmit(partial ? `${partial}_TIMEOUT` : 'TIMEOUT_FAIL');
          onTimeout?.();
          onFail?.();
        }
      } else {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    disabled,
    isSpectating,
    isLockedOut,
    isCompleted,
    currentIndex,
    letterTimeoutMs,
    typedLetters,
    onSubmit,
    onTimeout,
  ]);

  // Handle letter button press
  const handleLetterPress = useCallback(
    (pressedLetter: string) => {
      if (disabled || isSpectating || isLockedOut || isCompleted || hasSubmittedRef.current) {
        return;
      }

      const neededLetter = cleanTarget ? cleanTarget[currentIndex] : null;

      // 1. INCORRECT LETTER PRESSED
      if (neededLetter && pressedLetter !== neededLetter) {
        hasSubmittedRef.current = true;
        setWrongPressedLetter(pressedLetter);
        setIsLockedOut(true);
        setLockoutReason('Incorrect Guess');
        AudioHaptics.playIncorrect();

        try {
          Vibration.vibrate(80);
        } catch {}

        const attempted = [...typedLetters, pressedLetter].join('');
        onSubmit(attempted);
        onFail?.();
        return;
      }

      // 2. CORRECT LETTER PRESSED
      AudioHaptics.playTypewriterTick();
      try {
        Vibration.vibrate(25);
      } catch {}

      const newTyped = [...typedLetters, pressedLetter];
      setTypedLetters(newTyped);
      onKeystroke?.(newTyped);

      const nextIndex = currentIndex + 1;

      // Check if word completed OR reached max 8 letters limit (autocomplete!)
      if (nextIndex >= maxRequired) {
        hasSubmittedRef.current = true;
        setIsCompleted(true);

        if (cleanTarget.length > maxRequired) {
          // Autocomplete remaining letters
          setHasAutocompleted(true);
          const fullWordChars = cleanTarget.split('');
          setTypedLetters(fullWordChars);
          onKeystroke?.(fullWordChars);
          if (!hasPlayedCorrectRef.current) {
            hasPlayedCorrectRef.current = true;
            AudioHaptics.playCorrect();
          }

          setTimeout(() => {
            onSubmit(cleanTarget);
          }, 250);
        } else {
          // Exactly finished
          if (!hasPlayedCorrectRef.current) {
            hasPlayedCorrectRef.current = true;
            AudioHaptics.playCorrect();
          }
          onSubmit(cleanTarget || newTyped.join(''));
        }
        return;
      }

      // Advance to next letter: reset 2-second timer & generate 6 new choices
      setCurrentIndex(nextIndex);
      const nextChoices = getChoicesForIndex(nextIndex);
      setCurrentChoices(nextChoices);

      letterStartRef.current = Date.now();
      setTimeRemainingMs(letterTimeoutMs);
    },
    [
      disabled,
      isSpectating,
      isLockedOut,
      isCompleted,
      cleanTarget,
      currentIndex,
      typedLetters,
      maxRequired,
      letterTimeoutMs,
      getChoicesForIndex,
      onKeystroke,
      onSubmit,
    ]
  );

  // Timer calculations
  const progressRatio = Math.max(0, Math.min(1, timeRemainingMs / letterTimeoutMs));
  const secondsRemaining = (timeRemainingMs / 1000).toFixed(1);

  const getTimerBarColor = () => {
    if (progressRatio > 0.5) return Colors.correct; // #2E7D56
    if (progressRatio > 0.25) return Colors.gold; // #E08722
    return Colors.incorrect; // #C24134
  };

  // Determine displayed letters in slots
  const displaySlots: string[] = isSpectating
    ? spectatorInput || []
    : typedLetters;

  return (
    <View style={styles.container}>
      {/* 1. Header Bar: Mode badge & 2.0s countdown tag */}
      <View style={styles.headerRow}>
        <View style={styles.labelCluster}>
          {isSpectating ? (
            <>
              <View style={styles.spectateDot} />
              <Text style={styles.spectateLabel}>
                {opponentName ? `${opponentName.toUpperCase()} IS TYPING...` : 'OPPONENT TYPING...'}
              </Text>
            </>
          ) : (
            <View style={styles.modeBadgeRow}>
              <FlaticonIcon name="sparkles" size={12} color={Colors.primaryDark} variant="solid" />
              <Text style={styles.headerLabel}>
                DYNAMIC TYPING • {currentIndex + 1}/{maxRequired}
              </Text>
              {cleanTarget.length > maxLettersRequired && (
                <View style={styles.autoTag}>
                  <Text style={styles.autoTagText}>AUTO-8</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {!isSpectating && !isLockedOut && !isCompleted && (
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
        )}
      </View>

      {/* 2. High-Frequency 2-Second Progress Bar */}
      {!isSpectating && !isLockedOut && !isCompleted && (
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
      )}

      {/* 3. Answer Slots matching Pochi Solo's AnswerMask */}
      <View style={styles.slotsCard}>
        {Array.from({ length: totalSlots }).map((_, index) => {
          const letter = displaySlots[index];
          const isCurrentActive = index === displaySlots.length && !isSpectating && !isLockedOut && !isCompleted;
          const isAutocompletedSlot = hasAutocompleted && index >= maxLettersRequired;

          return (
            <View
              key={`slot-${index}`}
              style={[
                styles.slotBox,
                letter && styles.slotBoxFilled,
                isCurrentActive && styles.slotBoxActive,
                isAutocompletedSlot && styles.slotBoxAutocompleted,
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  letter && styles.slotTextFilled,
                  isCurrentActive && styles.slotTextActive,
                  isAutocompletedSlot && styles.slotTextAutocompleted,
                ]}
              >
                {letter || ''}
              </Text>
              {index >= maxLettersRequired && !letter && (
                <Text style={styles.slotSubAuto}>AUTO</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* 4. Lockout Alert Banner if user made an incorrect guess */}
      {isLockedOut && (
        <View style={styles.lockoutBanner}>
          <View style={styles.lockoutIconCircle}>
            <FlaticonIcon name="bolt" size={18} color="#FFFFFF" variant="solid" />
          </View>
          <View style={styles.lockoutTextCol}>
            <Text style={styles.lockoutTitle}>
              {lockoutReason || 'Incorrect Guess'}
            </Text>
            <Text style={styles.lockoutSubtitle}>
              You are locked out for the rest of this round (-10 pts)
            </Text>
          </View>
        </View>
      )}

      {/* 5. Autocomplete Celebration Banner */}
      {hasAutocompleted && (
        <View style={styles.autocompleteBanner}>
          <FlaticonIcon name="sparkles" size={16} color={Colors.correct} variant="solid" />
          <Text style={styles.autocompleteText}>
            8 LETTERS TYPED • AUTOCOMPLETED & SOLVED!
          </Text>
        </View>
      )}

      {/* 6. Dynamic 6 Letter Buttons (2 rows of 3 buttons) */}
      <View style={[styles.buttonsGrid, (isLockedOut || disabled || isCompleted) && styles.buttonsGridDisabled]}>
        {currentChoices.map((letter, idx) => {
          const isWrongPressed = wrongPressedLetter === letter;
          const isBtnDisabled = isLockedOut || disabled || isSpectating || isCompleted;

          return (
            <Pressable
              key={`choice-${idx}-${letter}`}
              onPress={() => handleLetterPress(letter)}
              disabled={isBtnDisabled}
              style={({ pressed }) => [
                styles.letterTile,
                isWrongPressed && styles.letterTileWrong,
                isBtnDisabled && !isWrongPressed && styles.letterTileDisabled,
                pressed && !isBtnDisabled && styles.letterTilePressed,
              ]}
            >
              <Text
                style={[
                  styles.letterTileText,
                  isWrongPressed && styles.letterTileTextWrong,
                  isBtnDisabled && !isWrongPressed && styles.letterTileTextDisabled,
                ]}
              >
                {letter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Hint */}
      <Text style={styles.bottomHint}>
        {isLockedOut
          ? 'Buzzer locked out • Watching remaining battle...'
          : isSpectating
          ? `${opponentName || 'Opponent'} is typing with 2s per letter...`
          : 'Tap correct letter • 2s per letter • Max 8 letters to solve'}
      </Text>
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
  modeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
  },
  autoTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  autoTagText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primaryDark,
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
    height: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  slotsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 58,
  },
  slotBox: {
    width: 34,
    height: 42,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  slotBoxActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldLight,
  },
  slotBoxAutocompleted: {
    borderColor: Colors.correct,
    backgroundColor: Colors.correctLight,
  },
  slotText: {
    fontFamily: Fonts.mono,
    fontSize: 18,
    fontWeight: '900',
    color: Colors.inkMuted,
  },
  slotTextFilled: {
    color: Colors.primaryDark,
  },
  slotTextActive: {
    color: Colors.goldDark,
  },
  slotTextAutocompleted: {
    color: Colors.correct,
  },
  slotSubAuto: {
    position: 'absolute',
    bottom: 2,
    fontFamily: Fonts.mono,
    fontSize: 7,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  lockoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.incorrectLight,
    borderWidth: 1.5,
    borderColor: Colors.incorrectBorder,
    borderRadius: 14,
    padding: 12,
  },
  lockoutIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.incorrect,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockoutTextCol: {
    flex: 1,
    gap: 2,
  },
  lockoutTitle: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    fontWeight: '900',
    color: Colors.incorrect,
    letterSpacing: 0.5,
  },
  lockoutSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkSecondary,
  },
  autocompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.correctLight,
    borderWidth: 1.5,
    borderColor: Colors.correctBorder,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  autocompleteText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.correct,
    letterSpacing: 0.5,
  },
  buttonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 4,
  },
  buttonsGridDisabled: {
    opacity: 0.4,
  },
  letterTile: {
    width: '31%',
    height: 62,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterTilePressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  letterTileWrong: {
    backgroundColor: Colors.incorrectLight,
    borderColor: Colors.incorrect,
    borderBottomColor: Colors.incorrect,
  },
  letterTileDisabled: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
    borderBottomWidth: 2,
  },
  letterTileText: {
    fontFamily: Fonts.mono,
    fontSize: 26,
    fontWeight: '900',
    color: Colors.ink,
  },
  letterTileTextWrong: {
    color: Colors.incorrect,
  },
  letterTileTextDisabled: {
    color: Colors.inkMuted,
  },
  bottomHint: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.inkMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
