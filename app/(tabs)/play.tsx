import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Flame, Settings, Sparkles } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnswerMask } from '../../src/components/game/AnswerMask';
import { AnswerSelection } from '../../src/components/game/AnswerSelection';
import { ClueStreamer } from '../../src/components/game/ClueStreamer';
import { ResolutionCard } from '../../src/components/game/ResolutionCard';
import {
  CategoryIcon,
  SpeedLightningIcon,
} from '../../src/components/icons/CategoryIcons';
import {
  AudienceCrowd,
  PochiLabrador,
} from '../../src/components/mascot/MascotVectors';
import { OptionsMenuModal } from '../../src/components/modal/OptionsMenuModal';
import { ReportModal } from '../../src/components/modal/ReportModal';
import { PochiRepository } from '../../src/data/repository';
import { calculateDualElo, getSpeedMultiplier } from '../../src/engine/eloEngine';
import { Colors, Shadows } from '../../src/theme/colors';
import { Fonts } from '../../src/theme/typography';
import {
  Category,
  EloChangeResult,
  Question,
  UserProfile,
} from '../../src/types';
import { AudioHaptics } from '../../src/utils/audioHaptics';

type GameState = 'streaming' | 'resolved';

export default function PlayScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const activeCategory = (params.category as Category) || 'all';

  const [gameState, setGameState] = useState<GameState>('streaming');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentSpeedMult, setCurrentSpeedMult] = useState<number>(2.0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [eloResult, setEloResult] = useState<EloChangeResult | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isScreenFocused, setIsScreenFocused] = useState<boolean>(true);
  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const currentRatioRef = useRef<number>(0);
  const servedHistory = useRef<string[]>([]);

  // Silence all trivia sounds and pause streaming ticker when navigating away from this tab
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      AudioHaptics.resume();

      return () => {
        setIsScreenFocused(false);
        // Immediately silence all active buzzes, audio tones, and haptics
        AudioHaptics.stopAll();
      };
    }, [])
  );

  // Sync AudioHaptics enabled state with user profile setting
  useEffect(() => {
    if (profile) {
      AudioHaptics.setEnabled(profile.sound_enabled !== false);
    }
  }, [profile?.sound_enabled]);

  // Load profile and next question
  const loadNextQuestion = useCallback(async () => {
    try {
      setIsLoadingNext(true);

      const user = await PochiRepository.getProfile();
      setProfile(user);

      const question = await PochiRepository.getNextQuestion(
        activeCategory,
        servedHistory.current
      );
      servedHistory.current.push(question.id);
      servedHistory.current.push(question.clue_text.trim().toLowerCase());

      // Scroll immediately back to top before mounting the new question
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });

      // Synchronously commit the new question & start streaming
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setIsCorrect(false);
      setEloResult(null);
      setCurrentSpeedMult(2.0);
      currentRatioRef.current = 0;
      setRevealedIndices([]);
      setGameState('streaming');

      const bookmarked = await PochiRepository.isBookmarked(question.id);
      setIsBookmarked(bookmarked);
    } catch (e) {
      console.warn('Error loading next question:', e);
    } finally {
      setIsLoadingNext(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  // Handle progressive word reveal ratio update: recalculate dynamic speed multiplier
  const handleProgressUpdate = useCallback(
    (ratio: number) => {
      currentRatioRef.current = ratio;
      const speedMult = getSpeedMultiplier(ratio);

      // Throttle speedMult state updates to reduce re-render thrashing
      setCurrentSpeedMult((prev) => {
        if (Math.abs(prev - speedMult) >= 0.05 || ratio >= 1.0) {
          return speedMult;
        }
        return prev;
      });

      if (gameState !== 'streaming' || !currentQuestion) return;

      // Strategic letter reveals in answer mask if user hasn't answered yet
      const cleanAnswer = currentQuestion.answer.replace(/\s+/g, '');
      if (ratio >= 0.40 && cleanAnswer.length > 3) {
        setRevealedIndices((prev) => (prev.length === 0 ? [0] : prev));
      }
      if (ratio >= 0.75 && cleanAnswer.length > 5) {
        setRevealedIndices((prev) => (prev.length <= 1 ? [0, cleanAnswer.length - 1] : prev));
      }
    },
    [gameState, currentQuestion]
  );

  // Stream completion: words have all revealed, multiplier drops to base 1.0x
  const handleStreamComplete = useCallback(() => {
    currentRatioRef.current = 1.0;
    setCurrentSpeedMult(1.0);
  }, []);

  // Answer selection: immediate 4-option response during or after word stream
  const handleSelectAnswer = useCallback(
    async (answerOption: string) => {
      if (gameState !== 'streaming' || !currentQuestion || !profile) return;

      // Freeze streaming and capture speed ratio immediately
      setGameState('resolved');
      setSelectedAnswer(answerOption);
      const correct =
        answerOption.toUpperCase() === currentQuestion.answer.toUpperCase();
      setIsCorrect(correct);

      if (correct) {
        AudioHaptics.playCorrect();
      } else {
        AudioHaptics.playIncorrect();
      }

      const answerRatio = currentRatioRef.current;
      const categoryElo =
        profile.category_elos[currentQuestion.category] ?? profile.overall_elo;

      // Dual-sided Elo Calculation factoring in speed multiplier
      const eloCalc = calculateDualElo({
        playerElo: categoryElo,
        questionElo: currentQuestion.elo_rating,
        isCorrect: correct,
        buzzProgressRatio: answerRatio,
      });
      setEloResult(eloCalc);

      // Update Profile
      const newStreak = correct ? profile.current_streak + 1 : 0;
      const bestStreak = Math.max(newStreak, profile.best_streak);
      const newCategoryElos = {
        ...profile.category_elos,
        [currentQuestion.category]: eloCalc.playerEloAfter,
      };

      const allValues = Object.values(newCategoryElos);
      const overallElo = Math.round(
        allValues.reduce((a, b) => a + b, 0) / allValues.length
      );

      const updatedProfile: UserProfile = {
        ...profile,
        overall_elo: overallElo,
        category_elos: newCategoryElos,
        total_played: profile.total_played + 1,
        total_correct: profile.total_correct + (correct ? 1 : 0),
        current_streak: newStreak,
        best_streak: bestStreak,
      };

      setProfile(updatedProfile);
      await PochiRepository.saveProfile(updatedProfile);

      // Smoothly bring resolution card and Next Question into full view
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);

      // Update Question's internal Elo & play stats
      await PochiRepository.updateQuestion({
        ...currentQuestion,
        elo_rating: eloCalc.questionEloAfter,
        times_served: currentQuestion.times_served + 1,
        times_correct: currentQuestion.times_correct + (correct ? 1 : 0),
      });
    },
    [gameState, currentQuestion, profile]
  );

  const handleToggleBookmark = async () => {
    if (!currentQuestion) return;
    const saved = await PochiRepository.toggleBookmark(currentQuestion);
    setIsBookmarked(saved);
  };

  if (!currentQuestion || !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <PochiLabrador size={64} expression="pensive" />
        <Text style={styles.loadingText}>Fetching next question...</Text>
      </SafeAreaView>
    );
  }

  const mascotExpression =
    gameState === 'resolved'
      ? isCorrect
        ? 'happy'
        : 'confused'
      : 'pensive';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Game Bar */}
      <View style={styles.topGameBar}>
        <View style={styles.leftCluster}>
          <View style={styles.categoryBadge}>
            <CategoryIcon category={currentQuestion.category} size={14} color={Colors.primaryDark} />
            <Text style={styles.categoryBadgeText}>
              {currentQuestion.category.toUpperCase()}
            </Text>
          </View>
          {currentQuestion.difficulty_tier && (
            <View style={styles.introTierBadge}>
              <Sparkles size={11} color={Colors.gold} />
              <Text style={styles.introTierBadgeText}>
                {currentQuestion.difficulty_tier === 'extremely_easy'
                  ? 'LEVEL 1'
                  : currentQuestion.difficulty_tier === 'very_easy'
                  ? 'LEVEL 2'
                  : 'LEVEL 3'}
              </Text>
            </View>
          )}
          <Pressable
            onPress={() => setOptionsModalVisible(true)}
            style={({ pressed }) => [
              styles.settingsBtn,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Settings size={18} color={Colors.ink} />
          </Pressable>
        </View>

        <View style={styles.topScoreCluster}>
          <View style={styles.streakTag}>
            <Flame size={15} color={Colors.gold} fill={Colors.gold} />
            <Text style={styles.streakNum}>{profile.current_streak}</Text>
          </View>
          <View style={styles.eloTag}>
            <Text style={styles.eloTagText}>{profile.overall_elo} ELO</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot stage banner */}
        <View style={styles.stageMascotRow}>
          <PochiLabrador size={72} expression={mascotExpression} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              {gameState === 'streaming' &&
                'Words are revealing... Answer quickly for up to 2.0x speed bonus!'}
              {gameState === 'resolved' &&
                (isCorrect
                  ? 'Outstanding! Speed & accuracy rewarded!'
                  : 'Close call! Check the breakdown below.')}
            </Text>
          </View>
        </View>

        {/* Answer Mask Slots (Optional based on user options toggle) */}
        {profile.show_letter_count !== false && (
          <AnswerMask
            answer={currentQuestion.answer}
            showFullAnswer={gameState === 'resolved'}
          />
        )}

        {/* Dynamic Smooth Clue Streamer */}
        <ClueStreamer
          key={currentQuestion.id}
          fullText={currentQuestion.clue_text}
          isStreaming={gameState === 'streaming'}
          isFrozen={gameState === 'resolved'}
          isPaused={!isScreenFocused || optionsModalVisible || reportModalVisible}
          onProgressUpdate={handleProgressUpdate}
          onStreamComplete={handleStreamComplete}
        />

        {/* Dynamic Speed Bonus Meter */}
        <View style={styles.speedBarRow}>
          <View
            style={[
              styles.speedPill,
              currentSpeedMult > 1.4 && styles.speedPillHigh,
            ]}
          >
            <SpeedLightningIcon
              size={13}
              color={currentSpeedMult > 1.4 ? Colors.gold : Colors.inkSecondary}
            />
            <Text
              style={[
                styles.speedPillText,
                currentSpeedMult > 1.4 && styles.speedPillTextHigh,
              ]}
            >
              {gameState === 'streaming'
                ? `${currentSpeedMult.toFixed(2)}x SPEED BONUS`
                : `${(eloResult?.speedMultiplier ?? 1.0).toFixed(2)}x SPEED ACHIEVED`}
            </Text>
          </View>
          <Text style={styles.speedHintText}>
            {gameState === 'streaming'
              ? 'Earlier answer = higher score'
              : (isCorrect ? 'Speed multiplier awarded!' : 'Result recorded')}
          </Text>
        </View>

        {/* Classic 4-Option Multiple Choice Grid (Directly interactive while streaming) */}
        <AnswerSelection
          key={`ans-${currentQuestion.id}`}
          options={currentQuestion.options}
          selectedAnswer={selectedAnswer}
          correctAnswer={currentQuestion.answer}
          isResolved={gameState === 'resolved'}
          onSelect={handleSelectAnswer}
          disabled={gameState === 'resolved'}
        />

        {/* Resolution Knowledge Card */}
        {gameState === 'resolved' && eloResult && (
          <ResolutionCard
            question={currentQuestion}
            isCorrect={isCorrect}
            eloResult={eloResult}
            isBookmarked={isBookmarked}
            isLoadingNext={isLoadingNext}
            onToggleBookmark={handleToggleBookmark}
            onOpenReport={() => setReportModalVisible(true)}
            onNextQuestion={loadNextQuestion}
          />
        )}

        {/* Audience Pit Vignette */}
        <View style={styles.audienceSection}>
          <AudienceCrowd excited={isCorrect && gameState === 'resolved'} />
        </View>
      </ScrollView>

      {/* Flag / Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        questionId={currentQuestion.id}
        onClose={() => setReportModalVisible(false)}
      />

      {/* Game Options Menu Modal (Answer Letter Count, Supabase Sync, Sound) */}
      <OptionsMenuModal
        visible={optionsModalVisible}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
        onClose={() => setOptionsModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.inkSecondary,
  },
  topGameBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: Colors.cardSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  introTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: '#F5C189',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  introTierBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.goldDark,
    letterSpacing: 0.5,
  },
  topScoreCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: '#F5C189',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  streakNum: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.goldDark,
  },
  eloTag: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eloTagText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  settingsBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  stageMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    gap: 12,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    ...Shadows.card,
  },
  speechText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.ink,
  },
  speedBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  speedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  speedPillHigh: {
    backgroundColor: Colors.goldLight,
    borderColor: Colors.gold,
  },
  speedPillText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
  },
  speedPillTextHigh: {
    color: Colors.goldDark,
  },
  speedHintText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkSecondary,
  },
  audienceSection: {
    marginTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
});
