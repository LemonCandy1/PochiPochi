import React, { useEffect, useMemo, useRef, useState } from 'react';
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
 * Sequential Word-by-Word Clue Streamer
 * Reveals question text word by word at high speed without revealing any
 * unrevealed future words to the user.
 */
export const ClueStreamer: React.FC<ClueStreamerProps> = ({
  fullText,
  isStreaming,
  isFrozen,
  onProgressUpdate,
  onStreamComplete,
}) => {
  // Split the clue into discrete words
  const words = useMemo(() => {
    return fullText ? fullText.trim().split(/\s+/).filter(Boolean) : [];
  }, [fullText]);

  // How many words have been sequentially revealed so far
  const [revealedWordsCount, setRevealedWordsCount] = useState<number>(1);
  const timerRef = useRef<any>(null);

  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;
  const onStreamCompleteRef = useRef(onStreamComplete);
  onStreamCompleteRef.current = onStreamComplete;

  // Reset to initial word on new question text
  useEffect(() => {
    setRevealedWordsCount(1);
    if (words.length > 0) {
      onProgressUpdateRef.current?.(1 / words.length);
    }
  }, [fullText, words.length]);

  // Pure interval ticker: increments revealedWordsCount every 240ms
  useEffect(() => {
    if (!isStreaming || isFrozen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setRevealedWordsCount((prev) => {
        if (prev >= words.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        AudioHaptics.playTypewriterTick();
        return prev + 1;
      });
    }, 240);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [words.length, isStreaming, isFrozen]);

  // Dedicated effect to notify parent on word reveal progress
  useEffect(() => {
    if (words.length > 0) {
      const ratio = Math.min(1, revealedWordsCount / words.length);
      onProgressUpdateRef.current?.(ratio);
      if (revealedWordsCount >= words.length && isStreaming && !isFrozen) {
        onStreamCompleteRef.current?.();
      }
    }
  }, [revealedWordsCount, words.length, isStreaming, isFrozen]);

  // If resolved/frozen, show full text so player can review complete clue
  // Otherwise, strictly show only the words revealed so far, with NO ghost or future text
  const visibleText = isFrozen
    ? fullText
    : words.slice(0, revealedWordsCount).join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.clueText}>
        <Text style={styles.visiblePart}>{visibleText}</Text>
        {isStreaming && !isFrozen && revealedWordsCount < words.length && (
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
