import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
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

  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;
  const onStreamCompleteRef = useRef(onStreamComplete);
  onStreamCompleteRef.current = onStreamComplete;

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
  // NO ghost text or placeholders for future characters.
  const visibleText = isFrozen ? fullText : fullText.slice(0, revealedChars);

  return (
    <View style={styles.container}>
      <Text style={styles.clueText}>
        <Text style={styles.visiblePart}>{visibleText}</Text>
        {isStreaming && !isFrozen && !isPaused && revealedChars < fullText.length && (
          <Text style={styles.cursor}> ▌</Text>
        )}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    shadowColor: Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  clueText: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '600',
    color: Colors.ink,
  },
  visiblePart: {
    color: Colors.ink,
  },
  cursor: {
    color: Colors.primary,
    fontWeight: '800',
  },
});
