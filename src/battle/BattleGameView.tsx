/**
 * BattleGameView.tsx
 * 
 * Pochi 1v1 Real-Time Multiplayer Battle Arena.
 * Matches Pochi Solo's warm café tactile aesthetic, typography, and state flow:
 * - Fair Bianca background (#F8F5EE)
 * - Top Game Bar with Category Badge, Flaticon Sparkles, and 1v1 Player Scoreboard
 * - Mascot Stage Row with reactive PochiLabrador & speech bubble commentary
 * - Letter-count AnswerMask
 * - Live character-by-character typewriter clue card
 * - Tactile 3D Pochi Buzzer with pulsating halo ring
 * - 4x4 dynamic matrix keypad with live opponent keystroke streaming
 * - Post-round resolution breakdown & game over victory celebration
 */

import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BattleKeypad } from './BattleKeypad';
import { useBattleClient } from './useBattleClient';
import { FlaticonIcon } from '../components/icons/FlaticonIcon';
import {
  CategoryIcon,
  SpeedLightningIcon,
} from '../components/icons/CategoryIcons';
import { PochiLabrador } from '../components/mascot/MascotVectors';
import { Colors, Shadows } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { Category } from '../types';

interface BattleGameViewProps {
  serverUrl?: string;
  roomId?: string;
  playerName?: string;
  onExit?: () => void;
}

export const BattleGameView: React.FC<BattleGameViewProps> = ({
  serverUrl = 'ws://localhost:4001',
  roomId = 'quick-match',
  playerName = 'PochiPlayer',
  onExit,
}) => {
  const {
    connectionStatus,
    rtt,
    clockOffset,
    isNtpCalibrated,
    roomState,
    players,
    myPlayer,
    opponentPlayer,
    round,
    totalRounds,
    category,
    streamedText,
    isStreamPaused,
    canBuzz,
    activeBuzzerId,
    activeBuzzerName,
    isMyTurnToAnswer,
    isLockedOut,
    answerLength,
    tiles,
    opponentKeystrokes,
    resolvedAnswer,
    resolvedFullQuestion,
    winner,
    penaltyAlert,
    buzz,
    submitAnswer,
    sendKeystroke,
  } = useBattleClient({
    serverUrl,
    roomId,
    playerName,
  });

  const pushAnim = useRef(new Animated.Value(0)).current;

  const handleBuzzerPressIn = () => {
    if (!canBuzz) return;
    Animated.timing(pushAnim, {
      toValue: 6,
      duration: 50,
      useNativeDriver: true,
    }).start();
  };

  const handleBuzzerPressOut = () => {
    Animated.spring(pushAnim, {
      toValue: 0,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  // Determine Mascot Expression matching Pochi Solo
  const mascotExpression =
    roomState === 'GAME_OVER'
      ? winner && myPlayer && winner.id === myPlayer.id
        ? 'excited'
        : 'pensive'
      : roomState === 'ROUND_RESOLVED'
      ? 'happy'
      : isMyTurnToAnswer
      ? 'excited'
      : isLockedOut
      ? 'confused'
      : 'pensive';

  // Mascot commentary speech text matching Pochi Solo
  const getMascotSpeech = () => {
    if (roomState === 'LOBBY') {
      return 'Waiting for a challenger to enter the 1v1 Battle Arena...';
    }
    if (roomState === 'ROUND_INTRO') {
      return `Round ${round}! Clue incoming, prepare your buzzer finger!`;
    }
    if (roomState === 'STREAMING') {
      return 'Words are revealing... Buzz in early for the +20 pt lead!';
    }
    if (roomState === 'BUZZ_ARBITRATION') {
      return 'Buzz received! Arbitrating true reaction speed...';
    }
    if (roomState === 'ANSWERING') {
      if (isMyTurnToAnswer) {
        return 'You won the buzz! Spell the answer quickly!';
      }
      return `${activeBuzzerName || 'Opponent'} buzzed in! Watching their spell...`;
    }
    if (roomState === 'ROUND_RESOLVED') {
      return `Target answer was ${resolvedAnswer || 'revealed'}! Speed & accuracy rewarded!`;
    }
    if (roomState === 'GAME_OVER') {
      return winner && myPlayer && winner.id === myPlayer.id
        ? 'VICTORY! Outstanding speed trivia champion!'
        : 'Epic battle! Rematch anytime in the arena.';
    }
    return 'Ready for trivia battle!';
  };

  const isOpponentAnswering =
    roomState === 'ANSWERING' &&
    Boolean(activeBuzzerId && myPlayer && activeBuzzerId !== myPlayer.id);

  const categoryKey = (category.toLowerCase().includes('science')
    ? 'science'
    : category.toLowerCase().includes('geography')
    ? 'geography'
    : category.toLowerCase().includes('anime')
    ? 'anime'
    : 'general') as Category;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* 1. Top Game Bar matching Pochi Solo */}
      <View style={styles.topGameBar}>
        <View style={styles.leftCluster}>
          {onExit && (
            <Pressable
              onPress={onExit}
              style={({ pressed }) => [styles.exitBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.exitBtnText}>LEAVE</Text>
            </Pressable>
          )}
          <View style={styles.categoryBadge}>
            <CategoryIcon category={categoryKey} size={13} color={Colors.primaryDark} />
            <Text style={styles.categoryBadgeText}>
              {category ? category.toUpperCase() : 'BATTLE'}
            </Text>
          </View>
          <View style={styles.roundTierBadge}>
            <FlaticonIcon name="sparkles" size={11} color={Colors.gold} variant="solid" />
            <Text style={styles.roundTierBadgeText}>
              ROUND {round || 1}/{totalRounds || 10}
            </Text>
          </View>
        </View>

        {/* Dual Player Scoreboard & Telemetry */}
        <View style={styles.topScoreCluster}>
          <View style={styles.telemetryPill}>
            <View
              style={[
                styles.syncDot,
                connectionStatus === 'CONNECTED'
                  ? styles.syncDotConnected
                  : styles.syncDotDisconnected,
              ]}
            />
            <Text style={styles.telemetryText}>
              {rtt > 0 ? `${Math.round(rtt)}ms` : 'SYNC'}
            </Text>
          </View>

          {/* 1v1 Scores */}
          <View style={styles.scorePill}>
            <Text style={styles.scorePillLabel}>YOU</Text>
            <Text style={styles.scorePillNum}>{myPlayer?.score ?? 0}</Text>
          </View>
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.scorePill, styles.opponentPill]}>
            <Text style={styles.scorePillLabel}>
              {opponentPlayer ? opponentPlayer.name.slice(0, 5).toUpperCase() : 'OPP'}
            </Text>
            <Text style={styles.scorePillNum}>{opponentPlayer?.score ?? 0}</Text>
          </View>
        </View>
      </View>

      {/* Penalty Alert Notification */}
      {penaltyAlert && (
        <View style={styles.penaltyAlertBar}>
          <FlaticonIcon name="bolt" size={14} color={Colors.incorrect} variant="solid" />
          <Text style={styles.penaltyAlertText}>{penaltyAlert}</Text>
        </View>
      )}

      {/* Main Content ScrollView */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mascot Stage Row matching Pochi Solo */}
        <View style={styles.stageMascotRow}>
          <PochiLabrador size={72} expression={mascotExpression} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{getMascotSpeech()}</Text>
          </View>
        </View>

        {/* Answer Mask Slots matching Pochi Solo */}
        {answerLength > 0 && roomState !== 'GAME_OVER' && (
          <View style={styles.maskContainer}>
            <Text style={styles.maskLabel}>TARGET ANSWER ({answerLength} LETTERS)</Text>
            <View style={styles.maskSlotsRow}>
              {Array.from({ length: answerLength }).map((_, idx) => {
                const char =
                  roomState === 'ROUND_RESOLVED' && resolvedAnswer
                    ? resolvedAnswer.replace(/[^A-Za-z0-9]/g, '')[idx]
                    : isOpponentAnswering
                    ? opponentKeystrokes[idx]
                    : null;

                return (
                  <View
                    key={`slot-${idx}`}
                    style={[
                      styles.maskSlotBox,
                      char && styles.maskSlotBoxFilled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.maskSlotText,
                        char && styles.maskSlotTextFilled,
                      ]}
                    >
                      {char || ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Live Clue Streamer Card */}
        {roomState !== 'LOBBY' && roomState !== 'ROUND_INTRO' && (
          <View style={styles.clueCard}>
            <View style={styles.clueCardTop}>
              <View style={styles.clueBadgeRow}>
                <View style={styles.liveStreamBadge}>
                  <Text style={styles.liveStreamBadgeText}>
                    {roomState === 'ROUND_RESOLVED'
                      ? 'FULL CLUE'
                      : isStreamPaused
                      ? 'BUZZ PAUSED'
                      : 'STREAMING'}
                  </Text>
                </View>
                <View style={styles.stakeBadge}>
                  <SpeedLightningIcon size={12} color={Colors.gold} />
                  <Text style={styles.stakeBadgeText}>
                    {activeBuzzerId ? '+20 PTS AT STAKE' : '+20 PTS SOLVE'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.clueText}>
              {roomState === 'ROUND_RESOLVED' ? (
                resolvedFullQuestion
              ) : (
                <>
                  {streamedText}
                  {roomState === 'STREAMING' && !isStreamPaused && (
                    <Text style={styles.cursorBlink}> |</Text>
                  )}
                </>
              )}
            </Text>
          </View>
        )}

        {/* Round Resolved Card matching ResolutionCard in Pochi Solo */}
        {roomState === 'ROUND_RESOLVED' && (
          <View style={styles.resolutionCard}>
            <View style={styles.resOutcomeBanner}>
              <Text style={styles.resOutcomeText}>ROUND RESOLVED</Text>
            </View>
            <View style={styles.resAnswerBox}>
              <Text style={styles.resAnswerLabel}>CORRECT ANSWER</Text>
              <Text style={styles.resAnswerTitle}>{resolvedAnswer}</Text>
            </View>
            <Text style={styles.resNextNotice}>
              Next battle round starting in a few seconds...
            </Text>
          </View>
        )}

        {/* Game Over Match Summary */}
        {roomState === 'GAME_OVER' && (
          <View style={styles.gameOverCard}>
            <View style={styles.trophyCircle}>
              <FlaticonIcon name="trophy" size={32} color={Colors.gold} variant="solid" />
            </View>
            <Text style={styles.gameOverTitle}>MATCH CONCLUDED</Text>
            <Text style={styles.gameOverSubtitle}>
              {winner ? `Winner: ${winner.name} (${winner.score} PTS)` : 'Match complete!'}
            </Text>
            <View style={styles.standingsBox}>
              <Text style={styles.standingsHeader}>FINAL ARENA STANDINGS</Text>
              {players.map((p, index) => (
                <View key={p.id} style={styles.standingRow}>
                  <Text style={styles.standingRank}>#{index + 1} {p.name}</Text>
                  <Text style={styles.standingScore}>{p.score} PTS</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Interactive Bottom Stage: 4x4 Keypad OR 3D Tactile Pochi Buzzer */}
        <View style={styles.bottomInteractiveStage}>
          {/* If You are Answering: Render BattleKeypad */}
          {isMyTurnToAnswer && (
            <BattleKeypad
              targetSlots={answerLength}
              tiles={tiles}
              timeoutMs={6000}
              onSubmit={submitAnswer}
              onKeystroke={sendKeystroke}
              onTimeout={() => {}}
            />
          )}

          {/* If Opponent is Answering: Render Spectator View */}
          {isOpponentAnswering && (
            <BattleKeypad
              targetSlots={answerLength}
              tiles={tiles}
              disabled={true}
              spectatorInput={opponentKeystrokes}
              opponentName={activeBuzzerName || 'Opponent'}
              onSubmit={() => {}}
            />
          )}

          {/* If Neither is Answering: Show Tactile 3D Pochi Buzzer */}
          {!isMyTurnToAnswer && !isOpponentAnswering && roomState !== 'GAME_OVER' && (
            <View style={styles.buzzerContainer}>
              {/* Outer Pulsating Halo when stream is active */}
              {canBuzz && <View style={styles.pulsatingHalo} />}

              {/* 3D Base Pedestal matching PochiBuzzer */}
              <View
                style={[
                  styles.buzzerBasePedestal,
                  !canBuzz && styles.buzzerBaseDisabled,
                ]}
              >
                <Animated.View
                  style={[
                    styles.buzzerAnimatedWrapper,
                    { transform: [{ translateY: pushAnim }] },
                  ]}
                >
                  <Pressable
                    onPressIn={handleBuzzerPressIn}
                    onPressOut={handleBuzzerPressOut}
                    onPress={buzz}
                    disabled={!canBuzz}
                    style={({ pressed }) => [
                      styles.buzzerButton,
                      !canBuzz && styles.buzzerBtnDisabled,
                      pressed && styles.buzzerPressed,
                    ]}
                  >
                    <View style={styles.buzzerInnerBevel}>
                      <Text style={styles.buzzerTextJapanese}>BUZZ!</Text>
                      <Text style={styles.buzzerTextEnglish}>POCHI</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              </View>

              <Text style={styles.buzzerSublabel}>
                {isLockedOut
                  ? 'LOCKED OUT FOR THIS QUESTION'
                  : canBuzz
                  ? 'TAP TO FREEZE CLUE & ANSWER (+20 PTS)'
                  : roomState === 'ROUND_INTRO'
                  ? 'PREPARE TO BUZZ...'
                  : 'BUZZER INACTIVE'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  topGameBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  leftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exitBtnText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkSecondary,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  categoryBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  roundTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  roundTierBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.goldDark,
  },
  topScoreCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  telemetryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncDotConnected: {
    backgroundColor: Colors.correct,
  },
  syncDotDisconnected: {
    backgroundColor: Colors.incorrect,
  },
  telemetryText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
  },
  scorePill: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  opponentPill: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
  },
  scorePillLabel: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  scorePillNum: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  vsBadge: {
    paddingHorizontal: 2,
  },
  vsText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '900',
    color: Colors.inkMuted,
  },
  penaltyAlertBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.incorrectLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.incorrectBorder,
  },
  penaltyAlertText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.incorrect,
  },
  stageMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  speechText: {
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 18,
  },
  maskContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 8,
    ...Shadows.card,
  },
  maskLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  maskSlotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  maskSlotBox: {
    width: 32,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maskSlotBoxFilled: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  maskSlotText: {
    fontFamily: Fonts.mono,
    fontSize: 16,
    fontWeight: '800',
    color: Colors.inkMuted,
  },
  maskSlotTextFilled: {
    color: Colors.primaryDark,
  },
  clueCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
    ...Shadows.cardElevated,
  },
  clueCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clueBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveStreamBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveStreamBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  stakeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  stakeBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.goldDark,
  },
  clueText: {
    fontFamily: Fonts.body,
    fontSize: 17,
    lineHeight: 26,
    color: Colors.ink,
  },
  cursorBlink: {
    color: Colors.primary,
    fontWeight: '800',
  },
  resolutionCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.correctBorder,
    alignItems: 'center',
    gap: 12,
    ...Shadows.cardElevated,
  },
  resOutcomeBanner: {
    backgroundColor: Colors.correctLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.correctBorder,
  },
  resOutcomeText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.correct,
    letterSpacing: 1,
  },
  resAnswerBox: {
    alignItems: 'center',
    gap: 4,
  },
  resAnswerLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  resAnswerTitle: {
    fontFamily: Fonts.mono,
    fontSize: 24,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 2,
  },
  resNextNotice: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkMuted,
  },
  gameOverCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    gap: 12,
    ...Shadows.cardElevated,
  },
  trophyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  gameOverTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.ink,
  },
  gameOverSubtitle: {
    fontFamily: Fonts.bodyBold,
    fontSize: 14,
    color: Colors.goldDark,
  },
  standingsBox: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  standingsHeader: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  standingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  standingRank: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.ink,
  },
  standingScore: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    fontWeight: '900',
    color: Colors.goldDark,
  },
  bottomInteractiveStage: {
    marginTop: 8,
    alignItems: 'center',
  },
  buzzerContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  pulsatingHalo: {
    position: 'absolute',
    top: 4,
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: 'rgba(224, 135, 34, 0.2)',
  },
  buzzerBasePedestal: {
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'flex-start',
    alignItems: 'center',
    ...Shadows.buzzer,
  },
  buzzerBaseDisabled: {
    backgroundColor: '#64748B',
    shadowOpacity: 0.1,
  },
  buzzerAnimatedWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  buzzerButton: {
    width: 140,
    height: 136,
    borderRadius: 68,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buzzerPressed: {
    backgroundColor: Colors.primaryDark,
  },
  buzzerBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  buzzerInnerBevel: {
    width: 120,
    height: 116,
    borderRadius: 58,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  buzzerTextJapanese: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  buzzerTextEnglish: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: '#E0E7FF',
    letterSpacing: 2,
  },
  buzzerSublabel: {
    fontFamily: Fonts.heading,
    marginTop: 12,
    fontSize: 11,
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
  },
});
