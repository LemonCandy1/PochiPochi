import * as WebBrowser from 'expo-web-browser';
import {
  Bookmark as BookmarkIcon,
  ExternalLink,
  Flag,
  Share2,
  Sparkles,
} from 'lucide-react-native';
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SpeedLightningIcon } from '../icons/CategoryIcons';
import { Colors, Shadows } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { EloChangeResult, Question } from '../../types';
import { getHtmlLinkProps, openExternalLink } from '../../utils/openLink';

interface ResolutionCardProps {
  question: Question;
  isCorrect: boolean;
  eloResult: EloChangeResult;
  selectedAnswer?: string | null;
  speedBonus?: number;
  timeRemaining?: number;
  isBookmarked?: boolean;
  isLoadingNext?: boolean;
  onToggleBookmark: () => void;
  onOpenReport: () => void;
  onNextQuestion: () => void;
}

export const ResolutionCard: React.FC<ResolutionCardProps> = ({
  question,
  isCorrect,
  eloResult,
  selectedAnswer,
  speedBonus,
  timeRemaining,
  isBookmarked = false,
  isLoadingNext = false,
  onToggleBookmark,
  onOpenReport,
  onNextQuestion,
}) => {
  const handleOpenWikipedia = async () => {
    if (Platform.OS === 'web') return;
    await openExternalLink(question.wikipedia_url, question.answer);
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
              <SpeedLightningIcon size={12} color={Colors.gold} />
              <Text style={styles.speedBonusTag}>
                {eloResult.speedMultiplier}x Speed
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Dynamic Special Introductory Category Banner */}
      {question.difficulty_tier && (
        <View style={styles.introCategoryBanner}>
          <Sparkles size={13} color="#B45309" />
          <Text style={styles.introCategoryBannerText}>
            {question.difficulty_tier === 'extremely_easy'
              ? 'SPECIAL INTRODUCTORY • LEVEL 1: EXTREMELY EASY'
              : question.difficulty_tier === 'very_easy'
              ? 'SPECIAL INTRODUCTORY • LEVEL 2: VERY EASY'
              : 'SPECIAL INTRODUCTORY • LEVEL 3: MEDIUM'}
          </Text>
        </View>
      )}

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
        {...getHtmlLinkProps(question.wikipedia_url, question.answer)}
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
          disabled={isLoadingNext}
          style={({ pressed }) => [
            styles.nextButton,
            isLoadingNext && { opacity: 0.6 },
            pressed && !isLoadingNext && styles.buttonPressed,
          ]}
        >
          <Text style={styles.nextButtonText}>
            {isLoadingNext ? 'Loading...' : 'Next Question →'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginVertical: 10,
    ...Shadows.cardElevated,
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
    fontFamily: Fonts.heading,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  statusTextCorrect: {
    color: Colors.correct,
  },
  statusTextIncorrect: {
    color: Colors.incorrect,
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
    fontFamily: Fonts.mono,
    fontSize: 13,
  },
  eloTextPositive: {
    color: Colors.correct,
  },
  eloTextNegative: {
    color: Colors.incorrect,
  },
  speedBonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  speedBonusTag: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.gold,
  },
  answerSection: {
    marginBottom: 10,
  },
  answerLabel: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.inkSecondary,
  },
  answerText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 20,
    color: Colors.primaryDark,
    letterSpacing: 0.3,
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
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.ink,
  },
  introCategoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: '#F5C189',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  introCategoryBannerText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.goldDark,
    letterSpacing: 0.5,
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
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
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
    borderColor: Colors.border,
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
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  nextButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: '#FFFFFF',
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
  },
});
