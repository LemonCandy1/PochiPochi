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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Settings, Share2 } from 'lucide-react-native';
import { BattleDynamicTyping } from './BattleDynamicTyping';
import { BattleKeypad } from './BattleKeypad';
import { BattleMultiChoice } from './BattleMultiChoice';
import { shareInvite } from './invite';
import { BattleJoinMode, useBattleClient } from './useBattleClient';
import { FlaticonIcon } from '../components/icons/FlaticonIcon';
import {
  CategoryIcon,
  SpeedLightningIcon,
} from '../components/icons/CategoryIcons';
import { PochiLabrador } from '../components/mascot/MascotVectors';
import { OptionsMenuModal } from '../components/modal/OptionsMenuModal';
import { PochiRepository } from '../data/repository';
import { Colors, Shadows } from '../theme/colors';
import { Fonts } from '../theme/typography';
import { BattleInputMode, Category, UserProfile } from '../types';

interface BattleGameViewProps {
  serverUrl?: string;
  mode?: BattleJoinMode;
  roomId?: string;
  password?: string;
  playerName?: string;
  onExit?: () => void;
  /** Called when the server rejects the join (wrong password, room full, ...) */
  onJoinError?: (message: string) => void;
}

export const BattleGameView: React.FC<BattleGameViewProps> = ({
  serverUrl = 'ws://localhost:4001',
  mode = 'quick',
  roomId: requestedRoomId = '',
  password = '',
  playerName = 'PochiPlayer',
  onExit,
  onJoinError,
}) => {
  const {
    connectionStatus,
    roomCode,
    isPrivateRoom,
    joinError,
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
    setIsLockedOut,
    answerLength,
    tiles,
    options,
    cleanAnswer,
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
    mode,
    roomId: requestedRoomId,
    password,
    playerName,
  });

  const roomId = roomCode || requestedRoomId || '…';

  useEffect(() => {
    if (joinError) onJoinError?.(joinError);
  }, [joinError, onJoinError]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [battleInputMode, setBattleInputMode] = useState<BattleInputMode>('matrix');
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  const handleShareInvite = useCallback(async () => {
    if (!roomCode) return;
    const result = await shareInvite(roomCode, password);
    if (result === 'copied') {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  }, [roomCode, password]);

  useEffect(() => {
    PochiRepository.getProfile().then((p) => {
      setProfile(p);
      if (p.battle_input_mode) {
        setBattleInputMode(p.battle_input_mode);
      }
    });
  }, []);

  const handleToggleInputMode = async () => {
    const nextMode: BattleInputMode =
      battleInputMode === 'matrix' ? 'multiple_choice' : 'matrix';
    setBattleInputMode(nextMode);
    if (profile) {
      const updated = { ...profile, battle_input_mode: nextMode };
      setProfile(updated);
      await PochiRepository.saveProfile(updated);
    }
  };

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
      return opponentPlayer
        ? `Matched against ${opponentPlayer.name}! Match starting soon...`
        : isPrivateRoom
        ? "Send your friend the room code and password. I'll wait right here!"
        : "Looking for a challenger... I'll spar with you if nobody shows up!";
    }
    if (roomState === 'ROUND_INTRO') {
      return `Round ${round}! Clue incoming against ${opponentPlayer?.name || 'your opponent'}!`;
    }
    if (roomState === 'STREAMING') {
      return opponentPlayer
        ? `Facing ${opponentPlayer.name}! Words are revealing... Buzz in early!`
        : 'Words are revealing... Buzz in early for the +20 pt lead!';
    }
    if (roomState === 'BUZZ_ARBITRATION') {
      return 'Buzz received! Arbitrating true reaction speed...';
    }
    if (roomState === 'ANSWERING') {
      if (isMyTurnToAnswer) {
        return 'You won the buzz! Spell the answer quickly!';
      }
      return `${opponentPlayer?.name || activeBuzzerName || 'Opponent'} buzzed in! Watching their spell...`;
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
              <ArrowLeft size={12} color={Colors.inkSecondary} />
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
              {roomState === 'LOBBY'
                ? isPrivateRoom
                  ? `ROOM: ${roomId}`
                  : 'QUICK MATCH'
                : `ROUND ${round || 1}/${totalRounds || 10}`}
            </Text>
          </View>

          {/* Quick Answering Mode Toggle Pill */}
          <Pressable
            onPress={handleToggleInputMode}
            style={styles.modeToggleBtn}
          >
            <FlaticonIcon
              name={battleInputMode === 'matrix' ? 'gamepad' : 'sparkles'}
              size={11}
              color={Colors.primaryDark}
              variant="solid"
            />
            <Text style={styles.modeToggleText}>
              {battleInputMode === 'matrix' ? 'DYNAMIC' : 'CHOICE'}
            </Text>
          </Pressable>

          {/* Settings Modal Button */}
          <Pressable
            onPress={() => setOptionsModalVisible(true)}
            style={({ pressed }) => [styles.settingsBtn, pressed && { opacity: 0.7 }]}
          >
            <Settings size={16} color={Colors.ink} />
          </Pressable>
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
              {connectionStatus !== 'CONNECTED'
                ? 'OFFLINE'
                : isNtpCalibrated
                ? rtt > 0
                  ? `${Math.round(rtt)}ms`
                  : '<1ms'
                : 'SYNCING'}
            </Text>
          </View>

          {/* 1v1 Scores */}
          <View style={styles.scorePill}>
            <Text style={styles.scorePillLabel} numberOfLines={1}>
              {myPlayer?.name || playerName || 'YOU'}
            </Text>
            <Text style={styles.scorePillNum}>{myPlayer?.score ?? 0}</Text>
          </View>
          <View style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.scorePill, styles.opponentPill]}>
            <Text style={styles.scorePillLabel} numberOfLines={1}>
              {opponentPlayer ? opponentPlayer.name : 'OPPONENT'}
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
        {/* 1v1 Opponent Matchup Banner */}
        <View style={styles.matchupBanner}>
          <View style={styles.matchupPlayerCol}>
            <View style={styles.matchupAvatarBox}>
              <FlaticonIcon name="gamepad" size={13} color={Colors.primaryDark} variant="solid" />
            </View>
            <View style={styles.matchupInfoCol}>
              <Text style={styles.matchupRoleTag}>YOU</Text>
              <Text style={styles.matchupPlayerName} numberOfLines={1}>
                {myPlayer?.name || playerName || 'PochiMaster'}
              </Text>
            </View>
            <Text style={styles.matchupScoreBadge}>{myPlayer?.score ?? 0} PTS</Text>
          </View>

          <View style={styles.matchupVsCircle}>
            <Text style={styles.matchupVsCircleText}>VS</Text>
          </View>

          <View style={[styles.matchupPlayerCol, styles.matchupOpponentCol]}>
            <View style={[styles.matchupAvatarBox, styles.matchupOpponentAvatar]}>
              <FlaticonIcon name="sparkles" size={13} color={Colors.goldDark} variant="solid" />
            </View>
            <View style={styles.matchupInfoCol}>
              <Text style={styles.matchupOpponentRoleTag}>
                {opponentPlayer ? 'OPPONENT' : isPrivateRoom ? `ROOM: ${roomId}` : 'QUICK MATCH'}
              </Text>
              <Text style={styles.matchupPlayerName} numberOfLines={1}>
                {opponentPlayer ? opponentPlayer.name : 'Waiting for challenger...'}
              </Text>
            </View>
            <Text style={[styles.matchupScoreBadge, styles.matchupOpponentScoreBadge]}>
              {opponentPlayer?.score ?? 0} PTS
            </Text>
          </View>
        </View>

        {/* Mascot Stage Row matching Pochi Solo */}
        <View style={styles.stageMascotRow}>
          <PochiLabrador size={72} expression={mascotExpression} />
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>{getMascotSpeech()}</Text>
          </View>
        </View>

        {/* Waiting for Challenger Room Card */}
        {roomState === 'LOBBY' && (
          <View style={styles.waitingCard}>
            <View style={styles.waitingHeaderRow}>
              <View style={styles.waitingPulseDot} />
              <Text style={styles.waitingHeaderTitle}>
                {opponentPlayer ? 'CHALLENGER MATCHED!' : 'WAITING FOR CHALLENGER'}
              </Text>
            </View>

            {isPrivateRoom && (
              <View style={styles.roomCodeBox}>
                <View style={styles.roomCodeRow}>
                  <View>
                    <Text style={styles.roomCodeLabel}>ROOM CODE</Text>
                    <Text style={styles.roomCodeValue} selectable>
                      {roomId}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.roomCodeLabel}>PASSWORD</Text>
                    <Text style={styles.roomCodeValue} selectable>
                      {password}
                    </Text>
                  </View>
                </View>
                {!opponentPlayer && (
                  <Pressable
                    onPress={handleShareInvite}
                    disabled={!roomCode}
                    accessibilityRole="button"
                    accessibilityLabel="Share room invite"
                    style={({ pressed }) => [
                      styles.copyBtn,
                      styles.inviteBtn,
                      pressed && styles.copyBtnPressed,
                    ]}
                  >
                    {hasCopied ? (
                      <Check size={14} color={Colors.correct} />
                    ) : (
                      <Share2 size={14} color={Colors.primaryDark} />
                    )}
                    <Text
                      style={[
                        styles.copyBtnText,
                        hasCopied && styles.copyBtnTextSuccess,
                      ]}
                    >
                      {hasCopied ? 'INVITE COPIED' : 'INVITE A FRIEND'}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}

            <Text style={styles.waitingSubtitle}>
              {opponentPlayer
                ? `Matched with ${opponentPlayer.name}! Round 1 starting shortly...`
                : isPrivateRoom
                ? 'Your friend enters this code and password under Join Room.'
                : 'Pairing you with another player...'}
            </Text>
          </View>
        )}

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

        {/* Interactive Bottom Stage: 4x4 Keypad OR MultiChoice OR 3D Tactile Buzzer */}
        <View style={styles.bottomInteractiveStage}>
          {/* Determine if it's player's turn to answer */}
          {(() => {
            const isAnswering = roomState === 'ANSWERING';
            const isMyTurn =
              isAnswering &&
              (isMyTurnToAnswer ||
                !isOpponentAnswering ||
                activeBuzzerId === myPlayer?.id ||
                activeBuzzerName === myPlayer?.name);

            if (isMyTurn) {
              if (battleInputMode === 'multiple_choice') {
                return (
                  <BattleMultiChoice
                    options={options}
                    timeoutMs={6000}
                    onSubmit={submitAnswer}
                    onTimeout={() => {}}
                  />
                );
              }

              return (
                <BattleDynamicTyping
                  targetAnswer={cleanAnswer || resolvedAnswer || ''}
                  targetSlots={answerLength}
                  letterTimeoutMs={2000}
                  onSubmit={submitAnswer}
                  onFail={() => setIsLockedOut(true)}
                  onKeystroke={sendKeystroke}
                  onTimeout={() => setIsLockedOut(true)}
                />
              );
            }

            if (isOpponentAnswering) {
              if (battleInputMode === 'multiple_choice') {
                return (
                  <BattleMultiChoice
                    options={options}
                    disabled={true}
                    opponentName={opponentPlayer?.name || activeBuzzerName || 'Opponent'}
                    onSubmit={() => {}}
                  />
                );
              }

              return (
                <BattleDynamicTyping
                  targetAnswer={cleanAnswer || resolvedAnswer || ''}
                  targetSlots={answerLength}
                  disabled={true}
                  spectatorInput={opponentKeystrokes}
                  opponentName={opponentPlayer?.name || activeBuzzerName || 'Opponent'}
                  onSubmit={() => {}}
                />
              );
            }

            if (roomState !== 'GAME_OVER') {
              const isBuzzerDisabled = !canBuzz || isLockedOut;

              return (
                <View style={styles.buzzerContainer}>
                  {/* Outer Pulsating Halo only when stream is active and NOT locked out */}
                  {canBuzz && !isLockedOut && <View style={styles.pulsatingHalo} />}

                  {/* 3D Base Pedestal */}
                  <View
                    style={[
                      styles.buzzerBasePedestal,
                      isBuzzerDisabled && styles.buzzerBaseDisabled,
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
                        disabled={isBuzzerDisabled}
                        style={({ pressed }) => [
                          styles.buzzerButton,
                          isBuzzerDisabled && styles.buzzerBtnDisabled,
                          pressed && !isBuzzerDisabled && styles.buzzerPressed,
                        ]}
                      >
                        <View
                          style={[
                            styles.buzzerInnerBevel,
                            isBuzzerDisabled && styles.buzzerInnerBevelDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.buzzerTextJapanese,
                              isBuzzerDisabled && styles.buzzerTextDisabled,
                            ]}
                          >
                            BUZZ!
                          </Text>
                          <Text
                            style={[
                              styles.buzzerTextEnglish,
                              isBuzzerDisabled && styles.buzzerTextDisabled,
                            ]}
                          >
                            POCHI
                          </Text>
                        </View>
                      </Pressable>
                    </Animated.View>
                  </View>

                  <Text
                    style={[
                      styles.buzzerSublabel,
                      isLockedOut && styles.buzzerSublabelLockedOut,
                    ]}
                  >
                    {isLockedOut
                      ? '🔒 LOCKED OUT FOR THIS ROUND'
                      : canBuzz
                      ? 'TAP TO FREEZE CLUE & ANSWER (+20 PTS)'
                      : roomState === 'ROUND_INTRO'
                      ? 'PREPARE TO BUZZ...'
                      : 'BUZZER INACTIVE'}
                  </Text>
                </View>
              );
            }

            return null;
          })()}
        </View>
      </ScrollView>

      {/* Options Menu Modal */}
      {profile && (
        <OptionsMenuModal
          visible={optionsModalVisible}
          profile={profile}
          onUpdateProfile={(updated) => {
            setProfile(updated);
            if (updated.battle_input_mode) {
              setBattleInputMode(updated.battle_input_mode);
            }
          }}
          onClose={() => setOptionsModalVisible(false)}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  modeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  modeToggleText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  settingsBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
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
  waitingCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 12,
    ...Shadows.cardElevated,
  },
  waitingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitingPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },
  waitingHeaderTitle: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: 1,
  },
  roomCodeBox: {
    width: '100%',
    backgroundColor: '#F3EFE6',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  roomCodeLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  roomCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  inviteBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 10, // comfortable thumb target
    borderRadius: 12,
  },
  roomCodeValue: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.primaryDark,
    letterSpacing: 1.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    ...Shadows.card,
  },
  copyBtnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  copyBtnText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  copyBtnTextSuccess: {
    color: Colors.correct,
  },
  waitingSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkSecondary,
    textAlign: 'center',
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
    backgroundColor: '#94A3B8',
    shadowColor: '#64748B',
    shadowOpacity: 0.05,
    elevation: 1,
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
    backgroundColor: '#CBD5E1', // Pure neutral grey, NO blue!
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
  buzzerInnerBevelDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
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
  buzzerTextDisabled: {
    color: '#64748B', // Neutral slate grey, no blue/white!
  },
  buzzerSublabel: {
    fontFamily: Fonts.heading,
    marginTop: 12,
    fontSize: 11,
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
  },
  buzzerSublabelLockedOut: {
    color: Colors.incorrect,
    fontWeight: '900',
  },
  matchupBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.card,
    gap: 8,
  },
  matchupPlayerCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  matchupOpponentCol: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
  },
  matchupAvatarBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchupOpponentAvatar: {
    backgroundColor: Colors.goldLight,
  },
  matchupInfoCol: {
    flex: 1,
  },
  matchupRoleTag: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    fontWeight: '900',
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  matchupOpponentRoleTag: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    fontWeight: '900',
    color: Colors.goldDark,
    letterSpacing: 0.5,
  },
  matchupPlayerName: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.ink,
  },
  matchupScoreBadge: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  matchupOpponentScoreBadge: {
    color: Colors.goldDark,
  },
  matchupVsCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchupVsCircleText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '900',
    color: Colors.inkMuted,
  },
});
