import { useLocalSearchParams } from 'expo-router';
import { Flame } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import { SpeedLightningIcon } from '../../src/components/icons/CategoryIcons';
import {
  AudienceCrowd,
  PochiLabrador,
} from '../../src/components/mascot/MascotVectors';
import { ReportModal } from '../../src/components/modal/ReportModal';
import { PochiRepository } from '../../src/data/repository';
import { calculateDualElo, getSpeedMultiplier } from '../../src/engine/eloEngine';
import { Colors } from '../../src/theme/colors';
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
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);

  const currentRatioRef = useRef<number>(0);
  const servedHistory = useRef<string[]>([]);

  // Load profile and initial question
  const loadNextQuestion = useCallback(async () => {
    setGameState('streaming');
    setSelectedAnswer(null);
    setIsCorrect(false);
    setEloResult(null);
    setCurrentSpeedMult(2.0);
    currentRatioRef.current = 0;
    setRevealedIndices([]);

    const user = await PochiRepository.getProfile();
    setProfile(user);

    const question = await PochiRepository.getNextQuestion(
      activeCategory,
      servedHistory.current
    );
    servedHistory.current.push(question.id);
    setCurrentQuestion(question);

    const bookmarked = await PochiRepository.isBookmarked(question.id);
    setIsBookmarked(bookmarked);
  }, [activeCategory]);

  useEffect(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  // Handle progressive word reveal ratio update: recalculate dynamic speed multiplier
  const handleProgressUpdate = useCallback((ratio: number) => {
    currentRatioRef.current = ratio;
    const speedMult = getSpeedMultiplier(ratio);
    setCurrentSpeedMult(speedMult);

    if (gameState !== 'streaming' || !currentQuestion) return;

    // Strategic letter reveals in answer mask if user hasn't answered yet
    const cleanAnswer = currentQuestion.answer.replace(/\s+/g, '');
    if (ratio >= 0.40 && cleanAnswer.length > 3) {
      setRevealedIndices((prev) => (prev.length === 0 ? [0] : prev));
    }
    if (ratio >= 0.75 && cleanAnswer.length > 5) {
      setRevealedIndices((prev) => (prev.length <= 1 ? [0, cleanAnswer.length - 1] : prev));
    }
  }, [gameState, currentQuestion]);

  // Stream completion: words have all revealed, multiplier drops to base 1.0x
  const handleStreamComplete = useCallback(() => {
    currentRatioRef.current = 1.0;
    setCurrentSpeedMult(1.0);
  }, []);

  // Answer selection: immediate 4-option response during or after word stream
  const handleSelectAnswer = async (answerOption: string) => {
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

    // Update Question's internal Elo & play stats
    await PochiRepository.updateQuestion({
      ...currentQuestion,
      elo_rating: eloCalc.questionEloAfter,
      times_served: currentQuestion.times_served + 1,
      times_correct: currentQuestion.times_correct + (correct ? 1 : 0),
    });
  };

  const handleToggleBookmark = async () => {
    if (!currentQuestion) return;
    const saved = await PochiRepository.toggleBookmark(currentQuestion);
    setIsBookmarked(saved);
  };

  if (!currentQuestion || !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <PochiLabrador size={64} expression="thinking" />
        <Text style={styles.loadingText}>Fetching next question...</Text>
      </SafeAreaView>
    );
  }

  const mascotExpression =
    gameState === 'resolved'
      ? isCorrect
        ? 'happy'
        : 'concerned'
      : 'thinking';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Game Bar */}
      <View style={styles.topGameBar}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {currentQuestion.category.toUpperCase()}
          </Text>
        </View>

        <View style={styles.topScoreCluster}>
          <View style={styles.streakTag}>
            <Flame size={15} color="#EF4444" fill="#EF4444" />
            <Text style={styles.streakNum}>{profile.current_streak}</Text>
          </View>
          <View style={styles.eloTag}>
            <Text style={styles.eloTagText}>{profile.overall_elo} ELO</Text>
          </View>
        </View>
      </View>

      <ScrollView
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

        {/* Answer Mask Slots */}
        <AnswerMask
          answer={currentQuestion.answer}
          revealedIndices={revealedIndices}
          showFullAnswer={gameState === 'resolved'}
        />

        {/* Sequential Word Streamer (Reveals words sequentially with NO ghost text) */}
        <ClueStreamer
          fullText={currentQuestion.clue_text}
          isStreaming={gameState === 'streaming'}
          isFrozen={gameState === 'resolved'}
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
              color={currentSpeedMult > 1.4 ? '#B45309' : Colors.inkSecondary}
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
  categoryBadge: {
    backgroundColor: Colors.cardSubtle,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  topScoreCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  streakNum: {
    fontSize: 12,
    fontWeight: '900',
    color: '#B91C1C',
  },
  eloTag: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  eloTagText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    padding: 10,
    shadowColor: Colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 2,
  },
  speechText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
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
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  speedPillHigh: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  speedPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
  },
  speedPillTextHigh: {
    color: '#92400E',
  },
  speedHintText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.inkSecondary,
  },
  audienceSection: {
    marginTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
});
