import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface AnswerMaskProps {
  answer: string;
  revealedIndices?: number[];
  showFullAnswer?: boolean;
}

export const AnswerMask: React.FC<AnswerMaskProps> = ({
  answer,
  revealedIndices = [],
  showFullAnswer = false,
}) => {
  const words = answer.toUpperCase().split(' ');
  let globalCharIndex = 0;

  return (
    <View style={styles.container}>
      <View style={styles.maskRow}>
        {words.map((word, wIdx) => {
          return (
            <View key={`word-${wIdx}`} style={styles.wordGroup}>
              {word.split('').map((char, cIdx) => {
                const currentIndex = globalCharIndex++;
                const isRevealed =
                  showFullAnswer || revealedIndices.includes(currentIndex);

                return (
                  <View
                    key={`char-${cIdx}`}
                    style={[
                      styles.slot,
                      isRevealed && styles.slotRevealed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isRevealed && styles.slotTextRevealed,
                      ]}
                    >
                      {isRevealed ? char : '_'}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
      <Text style={styles.hintLabel}>
        {answer.replace(/\s+/g, '').length} LETTERS
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  maskRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  wordGroup: {
    flexDirection: 'row',
    gap: 5,
    marginHorizontal: 4,
  },
  slot: {
    minWidth: 26,
    height: 34,
    borderRadius: 6,
    backgroundColor: Colors.cardSubtle,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  slotRevealed: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  slotText: {
    fontFamily: Fonts.mono,
    fontSize: 16,
    color: Colors.inkMuted,
    lineHeight: 22,
  },
  slotTextRevealed: {
    color: Colors.primaryDark,
  },
  hintLabel: {
    fontFamily: Fonts.mono,
    marginTop: 6,
    fontSize: 11,
    color: Colors.inkSecondary,
    letterSpacing: 1.2,
  },
});
