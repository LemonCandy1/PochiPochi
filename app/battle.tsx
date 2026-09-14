/**
 * battle.tsx
 * 
 * 1v1 Battle Arena Screen for PochiPochi.
 * Operates and looks identical to Pochi Solo with lobby setup and live 1v1 battle arena.
 */

import { router } from 'expo-router';
import { ArrowLeft, Play, Users, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BattleGameView } from '../src/battle/BattleGameView';
import { FlaticonIcon } from '../src/components/icons/FlaticonIcon';
import { PochiLabrador } from '../src/components/mascot/MascotVectors';
import { Colors, Shadows } from '../src/theme/colors';
import { Fonts } from '../src/theme/typography';

export default function BattleScreen() {
  const [inGame, setInGame] = useState(false);
  const [playerName, setPlayerName] = useState('PochiMaster');
  const [roomCode, setRoomCode] = useState('quick-match');
  const [serverUrl, setServerUrl] = useState(
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? `ws://${window.location.hostname || 'localhost'}:4001`
      : 'ws://localhost:4001'
  );

  if (inGame) {
    return (
      <BattleGameView
        serverUrl={serverUrl}
        roomId={roomCode.trim() || 'quick-match'}
        playerName={playerName.trim() || 'PochiPlayer'}
        onExit={() => setInGame(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <ArrowLeft size={20} color={Colors.ink} />
        </Pressable>
        <View style={styles.headerTitleCluster}>
          <Text style={styles.headerTitle}>1v1 Battle Arena</Text>
          <Text style={styles.headerSub}>REAL-TIME HARDWARE BUZZER</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Hero Card */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.modeBadge}>
              <Zap size={12} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.modeBadgeText}>LIVE ARENA</Text>
            </View>
            <View style={styles.ntpBadge}>
              <FlaticonIcon name="sparkles" size={11} color={Colors.gold} variant="solid" />
              <Text style={styles.ntpBadgeText}>NTP 60MS ARBITRATION</Text>
            </View>
          </View>

          <View style={styles.mascotBanner}>
            <PochiLabrador size={64} expression="excited" />
            <View style={styles.mascotTextCol}>
              <Text style={styles.heroTitle}>Pochi 1v1 Battle</Text>
              <Text style={styles.heroDescription}>
                Head-to-head live trivia. Words stream letter-by-letter. Buzz in mid-sentence and spell out the answer!
              </Text>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PLAYER CALLSIGN</Text>
            <TextInput
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Enter your callsign"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              maxLength={16}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>BATTLE ROOM CODE</Text>
            <TextInput
              value={roomCode}
              onChangeText={setRoomCode}
              placeholder="quick-match or custom room"
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              autoCapitalize="none"
            />
            <Text style={styles.inputHint}>
              Use 'quick-match' to match with open opponents, or enter a custom code for private games.
            </Text>
          </View>

          {/* Enter Arena CTA */}
          <Pressable
            onPress={() => setInGame(true)}
            style={({ pressed }) => [
              styles.enterBtn,
              pressed && styles.enterBtnPressed,
            ]}
          >
            <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.enterBtnText}>START BATTLE</Text>
          </Pressable>

          <View style={styles.tipBox}>
            <Users size={16} color={Colors.inkSecondary} />
            <Text style={styles.tipText}>
              Open two browser windows with the same room code to test live 1v1 buzz arbitration and opponent typing!
            </Text>
          </View>
        </View>
      </View>
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modeBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  ntpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  ntpBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    fontWeight: '800',
    color: Colors.goldDark,
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
  inputGroup: {
    gap: 6,
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
  inputHint: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    ...Shadows.cardElevated,
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
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkSecondary,
    lineHeight: 16,
  },
});
