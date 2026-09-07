import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Fonts } from '../../theme/typography';

interface AnswerSelectionProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  isResolved: boolean;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export const AnswerSelection = React.memo<AnswerSelectionProps>(({
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
            <View
              style={[
                styles.badgeIndex,
                isSelected && styles.badgeIndexSelected,
                isResolved && isCorrect && styles.badgeIndexCorrect,
                isResolved && isSelected && !isCorrect && styles.badgeIndexIncorrect,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isSelected && styles.badgeTextSelected,
                  isResolved && isCorrect && styles.badgeTextCorrect,
                ]}
              >
                {String.fromCharCode(65 + idx)}
              </Text>
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
});

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
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  optionButton: {
    backgroundColor: Colors.card,
  },
  buttonPressed: {
    transform: [{ translateY: 1 }],
    backgroundColor: Colors.primarySubtle,
    borderColor: Colors.primary,
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
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeIndexSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  badgeIndexCorrect: {
    backgroundColor: Colors.correct,
    borderColor: Colors.correct,
  },
  badgeIndexIncorrect: {
    backgroundColor: Colors.incorrect,
    borderColor: Colors.incorrect,
  },
  badgeText: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.ink,
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
  badgeTextCorrect: {
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 18,
  },
  textCorrect: {
    fontFamily: Fonts.bodyBold,
    color: Colors.correct,
  },
  textIncorrect: {
    fontFamily: Fonts.bodyBold,
    color: Colors.incorrect,
  },
});
