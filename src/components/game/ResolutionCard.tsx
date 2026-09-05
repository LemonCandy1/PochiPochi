import * as WebBrowser from 'expo-web-browser';
import {
  Bookmark as BookmarkIcon,
  ExternalLink,
  Flag,
  Share2,
} from 'lucide-react-native';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SpeedLightningIcon } from '../icons/CategoryIcons';
import { Colors, Shadows } from '../../theme/colors';
import { EloChangeResult, Question } from '../../types';

interface ResolutionCardProps {
  question: Question;
  isCorrect: boolean;
  eloResult: EloChangeResult;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenReport: () => void;
  onNextQuestion: () => void;
}

export const ResolutionCard: React.FC<ResolutionCardProps> = ({
  question,
  isCorrect,
  eloResult,
  isBookmarked,
  onToggleBookmark,
  onOpenReport,
  onNextQuestion,
}) => {
  const handleOpenWikipedia = async () => {
    try {
      await WebBrowser.openBrowserAsync(question.wikipedia_url);
    } catch (e) {
      console.warn('Failed to open Wikipedia', e);
    }
  };

  const isPositive = eloResult.deltaPlayer > 0;

  return (
    <View style={styles.card}>
      {/* Header Result Badge */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.statusBadge,
            isCorrect ? styles.badgeCorrect : styles.badgeIncorrect,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isCorrect ? styles.statusTextCorrect : styles.statusTextIncorrect,
            ]}
          >
            {isCorrect ? '✓ CORRECT ANSWER' : '✗ MISSED QUESTION'}
          </Text>
        </View>

        {/* Dynamic Elo Delta Badge */}
        <View
          style={[
            styles.eloDeltaPill,
            isPositive ? styles.eloPositive : styles.eloNegative,
          ]}
        >
          <Text
            style={[
              styles.eloDeltaText,
              isPositive ? styles.eloTextPositive : styles.eloTextNegative,
            ]}
          >
            {isPositive ? `+${eloResult.deltaPlayer}` : `${eloResult.deltaPlayer}`}{' '}
            Elo
          </Text>
          {eloResult.speedMultiplier > 1.2 && (
            <View style={styles.speedBonusRow}>
              <SpeedLightningIcon size={12} color="#D97706" />
              <Text style={styles.speedBonusTag}>
                {eloResult.speedMultiplier}x Speed
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Answer reveal */}
      <View style={styles.answerSection}>
        <Text style={styles.answerLabel}>TARGET ANSWER</Text>
        <Text style={styles.answerText}>{question.answer}</Text>
      </View>

      {/* Context Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>{question.context_summary}</Text>
      </View>

      {/* Wikipedia Deep Link */}
      <Pressable
        onPress={handleOpenWikipedia}
        style={({ pressed }) => [
          styles.wikiButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.wikiButtonText}>Learn more on Wikipedia</Text>
        <ExternalLink size={16} color={Colors.primaryDark} />
      </Pressable>

      {/* Action Footer: Bookmark, Flag, Next */}
      <View style={styles.footerRow}>
        <View style={styles.utilityActions}>
          <Pressable
            onPress={onToggleBookmark}
            style={({ pressed }) => [
              styles.iconBtn,
              isBookmarked && styles.iconBtnActive,
              pressed && styles.buttonPressed,
            ]}
          >
            <BookmarkIcon
              size={18}
              color={isBookmarked ? Colors.primaryDark : Colors.ink}
              fill={isBookmarked ? Colors.primary : 'none'}
            />
          </Pressable>

          <Pressable
            onPress={onOpenReport}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && styles.buttonPressed,
            ]}
          >
            <Flag size={18} color={Colors.inkSecondary} />
          </Pressable>
        </View>

        <Pressable
          onPress={onNextQuestion}
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.nextButtonText}>Next Question →</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.borderDark,
    padding: 16,
    marginVertical: 10,
    shadowColor: Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  badgeCorrect: {
    backgroundColor: Colors.correctLight,
    borderColor: Colors.correct,
  },
  badgeIncorrect: {
    backgroundColor: Colors.incorrectLight,
    borderColor: Colors.incorrect,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusTextCorrect: {
    color: '#15803D',
  },
  statusTextIncorrect: {
    color: '#B91C1C',
  },
  eloDeltaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'flex-end',
  },
  eloPositive: {
    backgroundColor: Colors.correctLight,
    borderColor: Colors.correct,
  },
  eloNegative: {
    backgroundColor: Colors.incorrectLight,
    borderColor: Colors.incorrect,
  },
  eloDeltaText: {
    fontSize: 13,
    fontWeight: '900',
  },
  eloTextPositive: {
    color: '#15803D',
  },
  eloTextNegative: {
    color: '#B91C1C',
  },
  speedBonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  speedBonusTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  answerSection: {
    marginBottom: 10,
  },
  answerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.inkSecondary,
  },
  answerText: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  summaryBox: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.ink,
    fontWeight: '500',
  },
  wikiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  wikiButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  utilityActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.cardSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
  },
});
