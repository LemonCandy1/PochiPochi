/**
 * battle.tsx
 *
 * 1v1 Battle Arena Screen for PochiPochi.
 * Lobby setup with three ways in — Quick Match, Create Room (code + password) and
 * Join Room — then hands off to the live BattleGameView.
 * Invite links (/battle?code=ABCDE&pw=1234) open straight into a prefilled Join Room.
 */

import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, DoorOpen, Play, Plus, Shuffle, Zap } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BattleGameView } from '../src/battle/BattleGameView';
import {
  MAX_PASSWORD_LENGTH,
  ROOM_CODE_LENGTH,
  generateRoomPin,
  isValidRoomCode,
  isValidRoomPassword,
  normalizeRoomCode,
} from '../src/battle/roomCode';
import { resolveBattleServerUrl } from '../src/battle/serverUrl';
import { BattleJoinMode } from '../src/battle/useBattleClient';
import { PochiLabrador } from '../src/components/mascot/MascotVectors';
import { PochiRepository } from '../src/data/repository';
import { Colors, Shadows } from '../src/theme/colors';
import { Fonts } from '../src/theme/typography';

const SERVER_URL = resolveBattleServerUrl();

const MODE_TABS: { key: BattleJoinMode; label: string; Icon: typeof Zap }[] = [
  { key: 'quick', label: 'Quick Match', Icon: Zap },
  { key: 'create', label: 'Create Room', Icon: Plus },
  { key: 'join', label: 'Join Room', Icon: DoorOpen },
];

function tapFeedback() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

export default function BattleScreen() {
  const params = useLocalSearchParams<{ code?: string; pw?: string }>();
  const invitedCode = normalizeRoomCode(typeof params.code === 'string' ? params.code : '');
  const invitedPassword = typeof params.pw === 'string' ? params.pw : '';

  const [inGame, setInGame] = useState(false);
  const [mode, setMode] = useState<BattleJoinMode>(invitedCode ? 'join' : 'quick');
  const [playerName, setPlayerName] = useState('');
  const [hostPassword, setHostPassword] = useState(generateRoomPin);
  const [joinCode, setJoinCode] = useState(invitedCode);
  const [joinPassword, setJoinPassword] = useState(invitedPassword);
  const [error, setError] = useState<string | null>(null);

  // Prefill the player's name from their profile so most people can tap straight through
  useEffect(() => {
    PochiRepository.getProfile()
      .then((p) => {
        if (p?.username) setPlayerName((current) => current || p.username.slice(0, 16));
      })
      .catch(() => {});
  }, []);

  // A fresh invite link opened while this screen is mounted
  useEffect(() => {
    if (invitedCode) {
      setMode('join');
      setJoinCode(invitedCode);
      setJoinPassword(invitedPassword);
      setError(null);
    }
  }, [invitedCode, invitedPassword]);

  const handleJoinError = useCallback((message: string) => {
    setInGame(false);
    setError(message);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  }, []);

  const selectMode = (next: BattleJoinMode) => {
    if (next === mode) return;
    tapFeedback();
    setMode(next);
    setError(null);
  };

  const validationError = (): string | null => {
    if (mode === 'create' && !isValidRoomPassword(hostPassword)) {
      return `Pick a password with 4-${MAX_PASSWORD_LENGTH} characters.`;
    }
    if (mode === 'join') {
      if (!isValidRoomCode(joinCode)) return `Room codes are ${ROOM_CODE_LENGTH} letters/numbers.`;
      if (!joinPassword.trim()) return 'Enter the room password.';
    }
    return null;
  };

  const canStart = validationError() === null;

  const handleStart = () => {
    const problem = validationError();
    if (problem) {
      setError(problem);
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setError(null);
    setInGame(true);
  };

  if (inGame) {
    return (
      <BattleGameView
        serverUrl={SERVER_URL}
        mode={mode}
        roomId={mode === 'join' ? joinCode : ''}
        password={mode === 'create' ? hostPassword.trim() : mode === 'join' ? joinPassword.trim() : ''}
        playerName={playerName.trim() || 'PochiPlayer'}
        onJoinError={handleJoinError}
        onExit={() => {
          setInGame(false);
          router.replace('/(tabs)');
        }}
      />
    );
  }

  const ctaLabel =
    mode === 'quick' ? 'FIND A MATCH' : mode === 'create' ? 'CREATE ROOM' : 'JOIN ROOM';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace('/(tabs)')}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <ArrowLeft size={20} color={Colors.ink} />
        </Pressable>
        <View style={styles.headerTitleCluster}>
          <Text style={styles.headerTitle}>1v1 Battle Arena</Text>
          <Text style={styles.headerSub}>REAL-TIME BUZZER</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.mascotBanner}>
              <PochiLabrador size={64} expression="excited" />
              <View style={styles.mascotTextCol}>
                <Text style={styles.heroTitle}>Pochi 1v1 Battle</Text>
                <Text style={styles.heroDescription}>
                  Clues stream letter-by-letter. Buzz in mid-sentence and spell the answer before your rival does.
                </Text>
              </View>
            </View>

            {/* Player name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>YOUR NAME</Text>
              <TextInput
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="What should your rival call you?"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
                maxLength={16}
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            {/* Mode switcher */}
            <View style={styles.modeTabs} accessibilityRole="tablist">
              {MODE_TABS.map(({ key, label, Icon }) => {
                const active = key === mode;
                return (
                  <Pressable
                    key={key}
                    onPress={() => selectMode(key)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    style={({ pressed }) => [
                      styles.modeTab,
                      active && styles.modeTabActive,
                      pressed && !active && { opacity: 0.7 },
                    ]}
                  >
                    <Icon size={15} color={active ? '#FFFFFF' : Colors.inkSecondary} />
                    <Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'quick' && (
              <Text style={styles.modeBlurb}>
                Get paired with whoever is online right now. If nobody shows up within a few seconds,
                PochiBot steps in to spar.
              </Text>
            )}

            {mode === 'create' && (
              <>
                <Text style={styles.modeBlurb}>
                  Host a private room. You'll get a room code to share; your friend joins with the code and
                  this password.
                </Text>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ROOM PASSWORD</Text>
                  <View style={styles.inlineRow}>
                    <TextInput
                      value={hostPassword}
                      onChangeText={(t) => {
                        setHostPassword(t);
                        setError(null);
                      }}
                      placeholder="4+ characters"
                      placeholderTextColor="#94A3B8"
                      style={[styles.textInput, styles.bigInput, { flex: 1 }]}
                      maxLength={MAX_PASSWORD_LENGTH}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <Pressable
                      onPress={() => {
                        tapFeedback();
                        setHostPassword(generateRoomPin());
                        setError(null);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Generate a new password"
                      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                    >
                      <Shuffle size={18} color={Colors.primaryDark} />
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            {mode === 'join' && (
              <>
                <Text style={styles.modeBlurb}>
                  Got a code from a friend? Enter it with the room password.
                </Text>
                <View style={styles.inlineRow}>
                  <View style={[styles.inputGroup, { flex: 3 }]}>
                    <Text style={styles.inputLabel}>ROOM CODE</Text>
                    <TextInput
                      value={joinCode}
                      onChangeText={(t) => {
                        setJoinCode(normalizeRoomCode(t));
                        setError(null);
                      }}
                      placeholder="ABCDE"
                      placeholderTextColor="#CBD5E1"
                      style={[styles.textInput, styles.bigInput, styles.codeInput]}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={ROOM_CODE_LENGTH + 2}
                      autoFocus={!invitedCode}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.inputLabel}>PASSWORD</Text>
                    <TextInput
                      value={joinPassword}
                      onChangeText={(t) => {
                        setJoinPassword(t);
                        setError(null);
                      }}
                      placeholder="1234"
                      placeholderTextColor="#CBD5E1"
                      style={[styles.textInput, styles.bigInput]}
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={MAX_PASSWORD_LENGTH}
                      onSubmitEditing={handleStart}
                      returnKeyType="go"
                    />
                  </View>
                </View>
              </>
            )}

            {error && (
              <View style={styles.errorBox} accessibilityLiveRegion="polite">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              onPress={handleStart}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canStart }}
              style={({ pressed }) => [
                styles.enterBtn,
                !canStart && styles.enterBtnDisabled,
                pressed && canStart && styles.enterBtnPressed,
              ]}
            >
              <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.enterBtnText}>{ctaLabel}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  headerTitleCluster: {
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: Colors.ink,
  },
  headerSub: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadows.cardElevated,
    gap: 16,
  },
  mascotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mascotTextCol: {
    flex: 1,
    gap: 3,
  },
  heroTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.ink,
  },
  heroDescription: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkSecondary,
    lineHeight: 18,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  modeTabActive: {
    backgroundColor: Colors.primary,
    ...Shadows.card,
  },
  modeTabText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.inkSecondary,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  modeBlurb: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkSecondary,
    lineHeight: 19,
  },
  inputGroup: {
    gap: 6,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inputLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  textInput: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: Colors.ink,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bigInput: {
    fontSize: 20,
    paddingVertical: 12,
    letterSpacing: 2,
  },
  codeInput: {
    textAlign: 'center',
    letterSpacing: 4,
  },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  errorBox: {
    backgroundColor: Colors.incorrectLight,
    borderColor: Colors.incorrectBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.incorrect,
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    minHeight: 52,
    borderRadius: 16,
    ...Shadows.cardElevated,
  },
  enterBtnDisabled: {
    opacity: 0.5,
  },
  enterBtnPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ translateY: 2 }],
  },
  enterBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
