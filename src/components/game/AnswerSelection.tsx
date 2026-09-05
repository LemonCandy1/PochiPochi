import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../theme/colors';

interface AnswerSelectionProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  isResolved: boolean;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export const AnswerSelection: React.FC<AnswerSelectionProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  isResolved,
  onSelect,
  disabled = false,
}) => {
  return (
    <View style={styles.gridContainer}>
      {options.map((option, idx) => {
        const isSelected = selectedAnswer === option;
        const isCorrect = option === correctAnswer;

        return (
          <Pressable
            key={`opt-${idx}`}
            onPress={() => onSelect(option)}
            disabled={disabled || isResolved}
            style={({ pressed }) => [
              styles.cardBase,
              styles.optionButton,
              isSelected && styles.buttonSelected,
              isResolved && isCorrect && styles.buttonCorrect,
              isResolved && isSelected && !isCorrect && styles.buttonIncorrect,
              pressed && !isResolved && styles.buttonPressed,
            ]}
          >
            <View style={styles.badgeIndex}>
              <Text style={styles.badgeText}>{String.fromCharCode(65 + idx)}</Text>
            </View>
            <Text
              style={[
                styles.optionText,
                isResolved && isCorrect && styles.textCorrect,
                isResolved && isSelected && !isCorrect && styles.textIncorrect,
              ]}
              numberOfLines={2}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 12,
  },
  cardBase: {
    width: '48%',
    minHeight: 62,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  optionButton: {
    backgroundColor: Colors.card,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
    backgroundColor: Colors.primarySubtle,
  },
  buttonSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  buttonCorrect: {
    backgroundColor: Colors.correctLight,
    borderColor: Colors.correct,
  },
  buttonIncorrect: {
    backgroundColor: Colors.incorrectLight,
    borderColor: Colors.incorrect,
  },
  badgeIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.ink,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
  },
  textCorrect: {
    color: '#15803D',
    fontWeight: '800',
  },
  textIncorrect: {
    color: '#B91C1C',
  },
});
