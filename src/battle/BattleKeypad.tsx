/**
 * BattleKeypad.tsx
 * 
 * 4x4 English Matrix Keypad Component built with pure React Native components,
 * styled to match Pochi Solo's warm café tactile aesthetic:
 * - Fair Bianca / White Card surfaces (#FFFFFF, border #E2DDD2)
 * - Answer slots matching AnswerMask typography & styling
 * - 3D tactile push-button matrix tiles with depth & used-tile states
 * - High-frequency 6-second countdown bar
 * - 1-click Backspace in Pochi Crimson (#C24134) & Clear buttons
 * - Instant auto-submit upon filling all slots
 * - Spectator mode showing opponent's live typed slots
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { MatrixTile } from './types';

export interface BattleKeypadProps {
  /** Target answer length (number of slots) */
  targetSlots: number;
  /** The 16 shuffled matrix tiles */
  tiles: MatrixTile[];
  /** Maximum timeout in milliseconds (default 6000ms) */
  timeoutMs?: number;
  /** Timestamp when answering phase started */
  startTime?: number;
  /** Callback fired automatically when all slots are filled */
  onSubmit: (answer: string) => void;
  /** Callback for real-time keystroke streaming to opponents */
  onKeystroke?: (currentSlots: string[]) => void;
  /** Callback when the countdown timer expires */
  onTimeout?: () => void;
  /** Whether the keypad is disabled */
  disabled?: boolean;
  /** If spectating, display the opponent's live typed letters */
  spectatorInput?: string[];
  /** Optional opponent name when spectating */
  opponentName?: string;
}

interface PlacedTile {
  tileId: string;
  letter: string;
}

export const BattleKeypad: React.FC<BattleKeypadProps> = ({
  targetSlots,
  tiles,
  timeoutMs = 6000,
  startTime,
  onSubmit,
  onKeystroke,
  onTimeout,
  disabled = false,
  spectatorInput,
  opponentName,
}) => {
  const isSpectating = Boolean(spectatorInput !== undefined);
  const [placedTiles, setPlacedTiles] = useState<PlacedTile[]>([]);
  const [usedTileIds, setUsedTileIds] = useState<Set<string>>(new Set());
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(timeoutMs);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const startTimestampRef = useRef<number>(startTime || Date.now());
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setPlacedTiles([]);
    setUsedTileIds(new Set());
    setHasSubmitted(false);
    startTimestampRef.current = startTime || Date.now();
    setTimeRemainingMs(timeoutMs);
  }, [tiles, targetSlots, startTime, timeoutMs]);

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

  // Handle tile tap
  const handleTilePress = useCallback(
    (tile: MatrixTile) => {
      if (disabled || isSpectating || hasSubmitted) return;
      if (usedTileIds.has(tile.id)) return;
      if (placedTiles.length >= targetSlots) return;

      try {
        Vibration.vibrate(25);
      } catch {}

      const newPlaced: PlacedTile[] = [
        ...placedTiles,
        { tileId: tile.id, letter: tile.letter },
      ];
      const newUsed = new Set(usedTileIds).add(tile.id);

      setPlacedTiles(newPlaced);
      setUsedTileIds(newUsed);

      const letterStrings = newPlaced.map((p) => p.letter);
      onKeystroke?.(letterStrings);

      // Instant auto-submit upon filling final slot
      if (newPlaced.length === targetSlots) {
        setHasSubmitted(true);
        const finalWord = letterStrings.join('');
        onSubmit(finalWord);
      }
    },
    [
      disabled,
      isSpectating,
      hasSubmitted,
      usedTileIds,
      placedTiles,
      targetSlots,
      onKeystroke,
      onSubmit,
    ]
  );

  // 1-Click Backspace
  const handleBackspace = useCallback(() => {
    if (disabled || isSpectating || hasSubmitted || placedTiles.length === 0) return;

    try {
      Vibration.vibrate(15);
    } catch {}

    const last = placedTiles[placedTiles.length - 1];
    const newPlaced = placedTiles.slice(0, -1);
    const newUsed = new Set(usedTileIds);
    newUsed.delete(last.tileId);

    setPlacedTiles(newPlaced);
    setUsedTileIds(newUsed);

    const letterStrings = newPlaced.map((p) => p.letter);
    onKeystroke?.(letterStrings);
  }, [disabled, isSpectating, hasSubmitted, placedTiles, usedTileIds, onKeystroke]);

  // Clear all slots
  const handleClear = useCallback(() => {
    if (disabled || isSpectating || hasSubmitted || placedTiles.length === 0) return;

    setPlacedTiles([]);
    setUsedTileIds(new Set());
    onKeystroke?.([]);
  }, [disabled, isSpectating, hasSubmitted, placedTiles.length, onKeystroke]);

  const progressRatio = Math.max(0, Math.min(1, timeRemainingMs / timeoutMs));
  const secondsRemaining = (timeRemainingMs / 1000).toFixed(1);

  const getTimerBarColor = () => {
    if (progressRatio > 0.5) return Colors.correct; // #2E7D56
    if (progressRatio > 0.25) return Colors.gold; // #E08722
    return Colors.incorrect; // #C24134
  };

  const displaySlots: string[] = isSpectating
    ? spectatorInput || []
    : placedTiles.map((p) => p.letter);

  return (
    <View style={styles.container}>
      {/* Top Header & 6-Second Timer Bar */}
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
            <Text style={styles.headerLabel}>SPELL THE ANSWER</Text>
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

      {/* Answer Slots: Exactly matching Pochi Solo's AnswerMask slots */}
      <View style={styles.slotsCard}>
        {Array.from({ length: targetSlots }).map((_, index) => {
          const letter = displaySlots[index];
          const isCurrentActive = index === displaySlots.length && !isSpectating;

          return (
            <View
              key={`slot-${index}`}
              style={[
                styles.slotBox,
                letter && styles.slotBoxFilled,
                isCurrentActive && styles.slotBoxActive,
              ]}
            >
              <Text
                style={[
                  styles.slotText,
                  letter && styles.slotTextFilled,
                  isCurrentActive && styles.slotTextActive,
                ]}
              >
                {letter || ''}
              </Text>
            </View>
          );
        })}
      </View>

      {/* 4x4 Dynamic Character Grid (16 3D tactile buttons) */}
      <View style={styles.matrixGrid}>
        {tiles.slice(0, 16).map((tile) => {
          const isUsed = usedTileIds.has(tile.id);
          const isKeyDisabled = disabled || isSpectating || hasSubmitted || isUsed;

          return (
            <Pressable
              key={tile.id}
              onPress={() => handleTilePress(tile)}
              disabled={isKeyDisabled}
              style={({ pressed }) => [
                styles.tileButton,
                isUsed && styles.tileButtonUsed,
                (isSpectating || disabled) && !isUsed && styles.tileButtonSpectating,
                pressed && !isKeyDisabled && styles.tileButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.tileText,
                  isUsed && styles.tileTextUsed,
                  (isSpectating || disabled) && !isUsed && styles.tileTextSpectating,
                ]}
              >
                {tile.letter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Controls: Clear & Backspace */}
      {!isSpectating && (
        <View style={styles.controlsRow}>
          <Pressable
            onPress={handleClear}
            disabled={disabled || hasSubmitted || placedTiles.length === 0}
            style={({ pressed }) => [
              styles.clearBtn,
              pressed && styles.clearBtnPressed,
              (disabled || hasSubmitted || placedTiles.length === 0) &&
                styles.controlBtnDisabled,
            ]}
          >
            <Text style={styles.clearBtnText}>CLEAR</Text>
          </Pressable>

          <Pressable
            onPress={handleBackspace}
            disabled={disabled || hasSubmitted || placedTiles.length === 0}
            style={({ pressed }) => [
              styles.backspaceBtn,
              pressed && styles.backspaceBtnPressed,
              (disabled || hasSubmitted || placedTiles.length === 0) &&
                styles.controlBtnDisabled,
            ]}
          >
            <Text style={styles.backspaceIcon}>⌫</Text>
            <Text style={styles.backspaceText}>BACKSPACE</Text>
          </Pressable>
        </View>
      )}
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
    minHeight: 56,
  },
  slotBox: {
    width: 36,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  slotBoxActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldLight,
  },
  slotText: {
    fontFamily: Fonts.mono,
    fontSize: 20,
    fontWeight: '900',
    color: Colors.inkMuted,
  },
  slotTextFilled: {
    color: Colors.primaryDark,
  },
  slotTextActive: {
    color: Colors.goldDark,
  },
  matrixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  tileButton: {
    width: '22.5%',
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileButtonPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  tileButtonUsed: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    opacity: 0.35,
    transform: [{ translateY: 2 }],
  },
  tileButtonSpectating: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
    opacity: 0.65,
  },
  tileText: {
    fontFamily: Fonts.mono,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
  },
  tileTextUsed: {
    color: Colors.inkMuted,
  },
  tileTextSpectating: {
    color: Colors.inkMuted,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnPressed: {
    backgroundColor: Colors.border,
  },
  clearBtnText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
  },
  backspaceBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.incorrect,
    borderWidth: 1.5,
    borderColor: Colors.incorrectBorder,
    borderBottomWidth: 3.5,
    borderBottomColor: '#991B1B',
  },
  backspaceBtnPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 1.5,
  },
  backspaceIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  backspaceText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  controlBtnDisabled: {
    opacity: 0.4,
  },
});
