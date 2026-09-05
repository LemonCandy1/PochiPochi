import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { AudioHaptics } from '../../utils/audioHaptics';

interface ClueStreamerProps {
  fullText: string;
  isStreaming: boolean;
  isFrozen: boolean;
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
  onProgressUpdate,
  onStreamComplete,
}) => {
  const [revealedChars, setRevealedChars] = useState<number>(1);
  const timerRef = useRef<any>(null);

  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;
  const onStreamCompleteRef = useRef(onStreamComplete);
  onStreamCompleteRef.current = onStreamComplete;

  // Reset to first character when question text changes
  useEffect(() => {
    setRevealedChars(1);
    if (fullText.length > 0) {
      onProgressUpdateRef.current?.(1 / fullText.length);
    }
  }, [fullText]);

  // Smooth per-letter interval ticker
  useEffect(() => {
    if (!isStreaming || isFrozen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // 28ms cadence for a rapid, fluid reading experience per letter
    timerRef.current = setInterval(() => {
      setRevealedChars((prev) => {
        if (prev >= fullText.length) {
          if (timerRef.current) clearInterval(timerRef.current);
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fullText.length, isStreaming, isFrozen]);

  // Notify parent component on progress update
  useEffect(() => {
    if (fullText.length > 0) {
      const ratio = Math.min(1, revealedChars / fullText.length);
      onProgressUpdateRef.current?.(ratio);
      if (revealedChars >= fullText.length && isStreaming && !isFrozen) {
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
        {isStreaming && !isFrozen && revealedChars < fullText.length && (
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
