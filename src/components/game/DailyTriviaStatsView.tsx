import {
  Bookmark as BookmarkIcon,
  Check,
  ChevronRight,
  ExternalLink,
  Flame,
  Home,
  Infinity as InfinityIcon,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X as CrossIcon,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PochiRepository } from '../../data/repository';
import { Colors, Shadows } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Category, Question, UserProfile } from '../../types';
import { getHtmlLinkProps, openExternalLink } from '../../utils/openLink';
import { CategoryIcon } from '../icons/CategoryIcons';
import { PochiLabrador } from '../mascot/MascotVectors';

export interface DailyTriviaQuestionResult {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
  speedMultiplier: number;
  globalPercentage: number;
  eloDelta?: number;
}

interface DailyTriviaStatsViewProps {
  results: DailyTriviaQuestionResult[];
  profile: UserProfile;
  onPlayUnlimited: () => void;
  onReviewNotebook: () => void;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const DailyTriviaStatsView: React.FC<DailyTriviaStatsViewProps> = ({
  results,
  profile,
  onPlayUnlimited,
  onReviewNotebook,
  onPlayAgain,
  onGoHome,
}) => {
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalCount = results.length || 10;
  const accuracyPct = Math.round((correctCount / totalCount) * 100);

  // Initialize bookmarked state for all 10 questions
  useEffect(() => {
    let isMounted = true;
    const checkBookmarks = async () => {
      const map: Record<string, boolean> = {};
      for (const res of results) {
        const isBm = await PochiRepository.isBookmarked(res.question.id);
        map[res.question.id] = isBm;
      }
      if (isMounted) setBookmarkedMap(map);
    };
    checkBookmarks();
    return () => {
      isMounted = false;
    };
  }, [results]);

  const handleToggleBookmark = async (question: Question) => {
    const isCurrentlySaved = bookmarkedMap[question.id] || false;
    // Optimistically update
    setBookmarkedMap((prev) => ({ ...prev, [question.id]: !isCurrentlySaved }));
    const saved = await PochiRepository.toggleBookmark(question);
    setBookmarkedMap((prev) => ({ ...prev, [question.id]: saved }));
  };

  const handleOpenWikipedia = async (answer: string, url?: string) => {
    if (Platform.OS === 'web') return;
    await openExternalLink(url || '', answer);
  };

  const getScoreRating = () => {
    if (correctCount === 10) {
      return {
        title: 'PERFECT SCORE!',
        sub: 'Flawless run! You mastered all 10 daily questions!',
        expression: 'excited' as const,
        badgeColor: Colors.gold,
      };
    }
    if (correctCount >= 8) {
      return {
        title: 'OUTSTANDING SPEED & KNOWLEDGE!',
        sub: 'Scholar Bear tier speed and precision. Superb job!',
        expression: 'happy' as const,
        badgeColor: Colors.correct,
      };
    }
    if (correctCount >= 6) {
      return {
        title: 'GREAT EFFORT!',
        sub: 'Smart Pup performance! Sharp instincts on today’s teaser.',
        expression: 'happy' as const,
        badgeColor: Colors.primary,
      };
    }
    if (correctCount >= 4) {
      return {
        title: 'SOLID TRY!',
        sub: 'Good effort. Review the missed questions in your notebook!',
        expression: 'pensive' as const,
        badgeColor: Colors.inkSecondary,
      };
    }
    return {
      title: 'KEEP PRACTICING!',
      sub: 'Every question learned makes Pochi smarter. Ready for more?',
      expression: 'pensive' as const,
      badgeColor: Colors.incorrect,
    };
  };

  const rating = getScoreRating();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Completion Header */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <PochiLabrador size={76} expression={rating.expression} />
          <View style={styles.heroTextCol}>
            <View style={styles.dailyBadge}>
              <Sparkles size={12} color="#FFFFFF" />
              <Text style={styles.dailyBadgeText}>DAILY TRIVIA COMPLETE</Text>
            </View>
            <Text style={styles.heroTitle}>{rating.title}</Text>
            <Text style={styles.heroSub}>{rating.sub}</Text>
          </View>
        </View>

        {/* Large Score Matrix */}
        <View style={styles.scoreMatrixRow}>
          {/* Main Score Box */}
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>
              {correctCount} <Text style={styles.scoreTotal}>/ {totalCount}</Text>
            </Text>
            <Text style={styles.scoreLabel}>CORRECT SOLVES</Text>
          </View>

          {/* Accuracy Box */}
          <View style={styles.statPillBox}>
            <Text
              style={[
                styles.statPillValue,
                { color: accuracyPct >= 70 ? Colors.correct : accuracyPct >= 50 ? Colors.goldDark : Colors.incorrect },
              ]}
            >
              {accuracyPct}%
            </Text>
            <Text style={styles.scoreLabel}>ACCURACY</Text>
          </View>

          {/* Current Elo Box */}
          <View style={styles.statPillBox}>
            <View style={styles.eloRow}>
              <Trophy size={14} color={Colors.primary} />
              <Text style={styles.statPillValueElo}>{profile.overall_elo}</Text>
            </View>
            <Text style={styles.scoreLabel}>OVERALL ELO</Text>
          </View>
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>10 QUESTIONS BREAKDOWN</Text>
        <Text style={styles.sectionSub}>Global % vs your answers</Text>
      </View>

      {/* List of All 10 Questions */}
      <View style={styles.questionsList}>
        {results.map((item, index) => {
          const q = item.question;
          const isSaved = bookmarkedMap[q.id] || false;
          const pct = item.globalPercentage;

          // Color coded progress bar: green if popular, gold if mid, red if rare
          const barColor =
            pct >= 65 ? Colors.correct : pct >= 45 ? Colors.gold : Colors.incorrect;

          return (
            <View key={q.id || `q-${index}`} style={styles.questionCard}>
              {/* Question Card Top Header */}
              <View style={styles.qCardHeader}>
                <View style={styles.qCardHeaderLeft}>
                  <View style={styles.qNumberPill}>
                    <Text style={styles.qNumberText}>Q{index + 1}</Text>
                  </View>
                  <View style={styles.qCategoryBadge}>
                    <CategoryIcon category={q.category} size={12} color={Colors.primaryDark} />
                    <Text style={styles.qCategoryText}>
                      {q.category.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.qCardHeaderRight}>
                  {/* Status Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      item.isCorrect
                        ? styles.statusPillCorrect
                        : styles.statusPillIncorrect,
                    ]}
                  >
                    {item.isCorrect ? (
                      <>
                        <Check size={12} color={Colors.correct} strokeWidth={3} />
                        <Text style={styles.statusCorrectText}>CORRECT</Text>
                      </>
                    ) : (
                      <>
                        <CrossIcon size={12} color={Colors.incorrect} strokeWidth={3} />
                        <Text style={styles.statusIncorrectText}>MISSED</Text>
                      </>
                    )}
                  </View>

                  {/* Bookmark Button */}
                  <Pressable
                    onPress={() => handleToggleBookmark(q)}
                    style={({ pressed }) => [
                      styles.bookmarkBtn,
                      isSaved && styles.bookmarkBtnSaved,
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityLabel="Save question to notebook"
                  >
                    <BookmarkIcon
                      size={15}
                      color={isSaved ? Colors.primaryDark : Colors.inkSecondary}
                      fill={isSaved ? Colors.primary : 'none'}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Clue Text */}
              <Text style={styles.qClueText}>{q.clue_text}</Text>

              {/* Answer comparison */}
              <View style={styles.answerBlock}>
                {item.isCorrect ? (
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Your Answer:</Text>
                    <Text style={styles.answerTextCorrect}>
                      {q.answer} ✓
                    </Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Your Guess:</Text>
                      <Text style={styles.answerTextIncorrect}>
                        {item.selectedAnswer || 'Timed Out'} ✗
                      </Text>
                    </View>
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Correct Answer:</Text>
                      <Text style={styles.answerTextCorrect}>
                        {q.answer}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Global Statistics Bar: Percentage of people that got it right */}
              <View style={styles.globalStatsBox}>
                <View style={styles.globalStatsHeader}>
                  <Text style={styles.globalStatsLabel}>
                    People who got this right:
                  </Text>
                  <Text style={[styles.globalStatsPct, { color: barColor }]}>
                    {pct}%
                  </Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${pct}%`, backgroundColor: barColor },
                    ]}
                  />
                </View>
                <View style={styles.globalStatsSubRow}>
                  <Text style={styles.difficultyTag}>
                    {pct >= 70
                      ? 'Common Knowledge'
                      : pct >= 45
                      ? 'Moderate Challenge'
                      : 'Brain-Melter'}
                  </Text>
                  <Text style={styles.eloSubText}>{q.elo_rating ?? 350} Elo</Text>
                </View>
              </View>

              {/* Wikipedia Link */}
              <Pressable
                {...getHtmlLinkProps(q.wikipedia_url, q.answer)}
                onPress={() => handleOpenWikipedia(q.answer, q.wikipedia_url)}
                style={({ pressed }) => [
                  styles.wikiLinkRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={styles.wikiLinkText}>Wikipedia Article</Text>
                <ExternalLink size={12} color={Colors.primaryDark} />
              </Pressable>
            </View>
          );
        })}
      </View>

      {/* Bottom CTA Actions */}
      <View style={styles.bottomActionsCol}>
        <Pressable
          onPress={onPlayUnlimited}
          style={({ pressed }) => [
            styles.primaryCtaBtn,
            pressed && styles.btnPressed,
          ]}
        >
          <InfinityIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.primaryCtaText}>CONTINUE IN UNLIMITED MODE</Text>
        </Pressable>

        <View style={styles.secondaryBtnRow}>
          <Pressable
            onPress={onReviewNotebook}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <BookmarkIcon size={16} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>OPEN NOTEBOOK</Text>
          </Pressable>

          <Pressable
            onPress={onPlayAgain}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <RotateCcw size={16} color={Colors.ink} />
            <Text style={styles.secondaryBtnText}>PLAY AGAIN</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onGoHome}
          style={({ pressed }) => [
            styles.homeBtn,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Home size={15} color={Colors.inkMuted} />
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },

  // Hero Card
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 18,
    marginBottom: 20,
    ...Shadows.cardElevated,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  heroTextCol: {
    flex: 1,
    gap: 4,
  },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  dailyBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
    lineHeight: 16,
  },

  // Score Matrix Row
  scoreMatrixRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderColor: Colors.border,
  },
  scoreBox: {
    flex: 1.2,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.primary,
  },
  scoreTotal: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.inkMuted,
  },
  scoreLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 9,
    color: Colors.inkMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statPillBox: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPillValue: {
    fontFamily: Fonts.heading,
    fontSize: 20,
  },
  eloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statPillValueElo: {
    fontFamily: Fonts.mono,
    fontSize: 17,
    color: Colors.ink,
  },

  // Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
  },

  // Question Cards
  questionsList: {
    gap: 12,
    marginBottom: 20,
  },
  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    padding: 14,
    gap: 10,
    ...Shadows.card,
  },
  qCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qNumberPill: {
    backgroundColor: Colors.primarySubtle,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  qNumberText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.primary,
  },
  qCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  qCategoryText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 9,
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
  },
  qCardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillCorrect: {
    backgroundColor: Colors.correctLight,
    borderWidth: 1,
    borderColor: Colors.correctBorder,
  },
  statusPillIncorrect: {
    backgroundColor: Colors.incorrectLight,
    borderWidth: 1,
    borderColor: Colors.incorrectBorder,
  },
  statusCorrectText: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: Colors.correct,
  },
  statusIncorrectText: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: Colors.incorrect,
  },
  bookmarkBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkBtnSaved: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  qClueText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 18,
  },

  // Answers
  answerBlock: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerLabel: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  answerTextCorrect: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.correct,
  },
  answerTextIncorrect: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.incorrect,
  },

  // Global Statistics Bar
  globalStatsBox: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    gap: 6,
  },
  globalStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  globalStatsLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 11,
    color: Colors.inkSecondary,
  },
  globalStatsPct: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  globalStatsSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyTag: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.inkMuted,
  },
  eloSubText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.inkMuted,
  },

  // Wikipedia Link
  wikiLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  wikiLinkText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 11,
    color: Colors.primaryDark,
    textDecorationLine: 'underline',
  },

  // Bottom Actions
  bottomActionsCol: {
    gap: 10,
    marginTop: 8,
  },
  primaryCtaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Shadows.hard,
  },
  primaryCtaText: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    ...Shadows.card,
  },
  secondaryBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.ink,
    letterSpacing: 0.5,
  },
  btnPressed: {
    transform: [{ translateY: 1 }],
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  homeBtnText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
  },
});
