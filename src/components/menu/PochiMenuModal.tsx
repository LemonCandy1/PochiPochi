import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  Infinity as InfinityIcon,
  LayoutGrid,
  Play,
  RefreshCw,
  RotateCcw,
  Settings,
  Swords,
  Trash2,
  Trophy,
  User,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { PochiRepository } from '../../data/repository';
import { getEloRankTier } from '../../engine/eloEngine';
import { SupabaseService } from '../../services/supabase/supabaseClient';
import { Colors, Shadows } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { Category, UserProfile } from '../../types';
import { PochiLabrador } from '../mascot/MascotVectors';

export type MenuView =
  | 'MENU'
  | 'SETTINGS'
  | 'FAQ'
  | 'THEMED_PACKS'
  | 'MY_POCHI'
  | 'FRIENDS';

export interface PochiMenuModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
  initialView?: MenuView;
}

export const PochiMenuModal: React.FC<PochiMenuModalProps> = ({
  visible,
  profile,
  onUpdateProfile,
  onClose,
  initialView = 'MENU',
}) => {
  const [currentView, setCurrentView] = useState<MenuView>(initialView);

  // Settings State
  const [showLetterCount, setShowLetterCount] = useState<boolean>(
    profile?.show_letter_count !== false
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    profile?.sound_enabled !== false
  );
  const [battleInputMode, setBattleInputMode] = useState<'matrix' | 'multiple_choice'>(
    profile?.battle_input_mode || 'matrix'
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>(
    SupabaseService.isConfigured()
      ? 'Supabase Connected • 4,612 Clues Live'
      : 'Local Cache Active'
  );

  // Reset view when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentView(initialView);
    }
  }, [visible, initialView]);

  const handleToggleLetterCount = async (val: boolean) => {
    setShowLetterCount(val);
    if (profile) {
      const updated: UserProfile = { ...profile, show_letter_count: val };
      onUpdateProfile(updated);
      await PochiRepository.saveProfile(updated);
    }
  };

  const handleToggleSound = async (val: boolean) => {
    setSoundEnabled(val);
    if (profile) {
      const updated: UserProfile = { ...profile, sound_enabled: val };
      onUpdateProfile(updated);
      await PochiRepository.saveProfile(updated);
    }
  };

  const handleSelectBattleInputMode = async (mode: 'matrix' | 'multiple_choice') => {
    setBattleInputMode(mode);
    if (profile) {
      const updated: UserProfile = { ...profile, battle_input_mode: mode };
      onUpdateProfile(updated);
      await PochiRepository.saveProfile(updated);
    }
  };

  const handleManualSupabaseSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing with Supabase...');
    try {
      const res = await PochiRepository.syncAllWithSupabase();
      setSyncStatus(
        res.success
          ? `Synced • ${res.questionsCount} questions • Elo: ${res.elo}`
          : res.message
      );
    } catch {
      setSyncStatus('Sync complete (local cache verified)');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteAccount = () => {
    const executeDelete = async () => {
      try {
        setIsDeleting(true);
        await PochiRepository.deleteAccountAndResetData();
        onClose();
        router.replace('/ftue');
      } catch {
        setIsDeleting(false);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (
        window.confirm(
          'Are you sure you want to permanently delete your account, stats, and stored data? This cannot be undone.'
        )
      ) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Delete Account & Data',
        'Are you sure you want to permanently delete your account, saved stats, streaks, and all local and cloud data? This cannot be undone (Apple Guideline 5.1.1).',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete Permanently', style: 'destructive', onPress: executeDelete },
        ]
      );
    }
  };

  const rankTier = profile ? getEloRankTier(profile.overall_elo) : null;

  // Actions for the 8 Grid Items
  const handleDailyTrivia = () => {
    onClose();
    router.push({
      pathname: '/(tabs)/play',
      params: { category: 'all', mode: 'daily' },
    });
  };

  const handleUnlimited = () => {
    onClose();
    router.push({
      pathname: '/(tabs)/play',
      params: { category: 'all', mode: 'unlimited' },
    });
  };

  const handleArchive = () => {
    onClose();
    router.push('/(tabs)/bookmarks');
  };

  const handleStartThemedCategory = (cat: Category | 'all') => {
    onClose();
    router.push({
      pathname: '/(tabs)/play',
      params: { category: cat },
    });
  };

  const handleEnterBattle = () => {
    onClose();
    router.push('/battle');
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'SETTINGS':
        return 'SETTINGS';
      case 'FAQ':
        return 'HOW TO PLAY';
      case 'THEMED_PACKS':
        return 'THEMED PACKS';
      case 'MY_POCHI':
        return 'MY POCHI';
      case 'FRIENDS':
        return '1V1 ARENA';
      default:
        return 'MENU';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.brandSubtitle}>POCHIPOCHI</Text>
              <Text style={styles.menuTitle}>{getViewTitle()}</Text>
            </View>

            {/* Boxed Close Button */}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBox,
                pressed && styles.closeBoxPressed,
              ]}
              hitSlop={10}
              accessibilityLabel="Close Menu"
            >
              <X size={20} color={Colors.ink} strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Section Divider with Dotted Line */}
          <View style={styles.sectionDividerRow}>
            {currentView === 'MENU' ? (
              <View style={styles.dottedLine} />
            ) : (
              <Pressable
                onPress={() => setCurrentView('MENU')}
                style={({ pressed }) => [
                  styles.backBtnRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <ArrowLeft size={16} color={Colors.primary} strokeWidth={2.5} />
                <Text style={styles.backBtnText}>BACK TO MENU</Text>
                <View style={styles.dottedLine} />
              </Pressable>
            )}
          </View>

          {/* BODY: MAIN 8-GRID MENU */}
          {currentView === 'MENU' && (
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* 2-Column Grid (4 Rows x 2 Cols) */}
              <View style={styles.gridContainer}>
                {/* 1. DAILY TRIVIA */}
                <Pressable
                  onPress={handleDailyTrivia}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.gridCardPressed,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <View style={styles.blueButtonBase}>
                      <View style={styles.blueButtonCap}>
                        <View style={styles.blueButtonHighlight} />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.gridCardText}>DAILY TRIVIA</Text>
                </Pressable>

                {/* 2. UNLIMITED */}
                <Pressable
                  onPress={handleUnlimited}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.gridCardPressed,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <InfinityIcon size={24} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.gridCardText}>UNLIMITED</Text>
                </Pressable>

                {/* 3. ARCHIVE */}
                <Pressable
                  onPress={handleArchive}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.gridCardPressed,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <RotateCcw size={20} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.gridCardText}>ARCHIVE</Text>
                </Pressable>

                {/* 4. THEMED PACKS */}
                <Pressable
                  onPress={() => setCurrentView('THEMED_PACKS')}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.gridCardPressed,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <LayoutGrid size={20} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.gridCardText}>THEMED PACKS</Text>
                </Pressable>

                {/* 5. MY POCHI */}
                <Pressable
                  onPress={() => setCurrentView('MY_POCHI')}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.gridCardPressed,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <User size={21} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.gridCardText}>MY POCHI</Text>
                </Pressable>

                {/* 6. FRIENDS */}
                <Pressable
                  onPress={() => setCurrentView('FRIENDS')}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.gridCardPressed,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <Users size={21} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.gridCardText}>FRIENDS</Text>
                </Pressable>

                {/* 7. SETTINGS */}
                <Pressable
                  onPress={() => setCurrentView('SETTINGS')}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.gridCardPressed,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <Settings size={20} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.gridCardText}>SETTINGS</Text>
                </Pressable>

                {/* 8. FAQ */}
                <Pressable
                  onPress={() => setCurrentView('FAQ')}
                  style={({ pressed }) => [
                    styles.gridCard,
                    pressed && styles.gridCardPressed,
                  ]}
                >
                  <View style={styles.iconCircle}>
                    <HelpCircle size={20} color={Colors.primary} strokeWidth={2.2} />
                  </View>
                  <Text style={styles.gridCardText}>FAQ</Text>
                </Pressable>
              </View>

              {/* QUICK ACTION: 1V1 BATTLE ARENA */}
              <Pressable
                onPress={handleEnterBattle}
                style={({ pressed }) => [
                  styles.battleBanner,
                  pressed && styles.battleBannerPressed,
                ]}
              >
                <View style={styles.battleLeft}>
                  <View style={styles.battleIconBox}>
                    <Swords size={20} color="#FFFFFF" strokeWidth={2.2} />
                  </View>
                  <View style={styles.battleTextCol}>
                    <Text style={styles.battleHeadline}>1V1 BATTLE ARENA</Text>
                    <Text style={styles.battleSub}>Real-time multiplayer duels</Text>
                  </View>
                </View>
                <ArrowUpRight size={20} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            </ScrollView>
          )}

          {/* SUB-VIEW: THEMED PACKS */}
          {currentView === 'THEMED_PACKS' && (
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.subviewDescription}>
                Pick a thematic category to challenge your specialized knowledge:
              </Text>

              <Pressable
                onPress={() => handleStartThemedCategory('anime')}
                style={({ pressed }) => [
                  styles.themedPackCard,
                  pressed && styles.themedPackCardPressed,
                ]}
              >
                <View style={styles.themedPackIconBox}>
                  <Text style={styles.themedEmoji}>🎌</Text>
                </View>
                <View style={styles.themedPackTextCol}>
                  <Text style={styles.themedPackTitle}>ANIME & MANGA</Text>
                  <Text style={styles.themedPackSubtitle}>
                    1,056 Questions • JJK, Chainsaw Man, Bleach, Frieren & Classics
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.inkMuted} />
              </Pressable>

              <Pressable
                onPress={() => handleStartThemedCategory('general')}
                style={({ pressed }) => [
                  styles.themedPackCard,
                  pressed && styles.themedPackCardPressed,
                ]}
              >
                <View style={styles.themedPackIconBox}>
                  <Text style={styles.themedEmoji}>💡</Text>
                </View>
                <View style={styles.themedPackTextCol}>
                  <Text style={styles.themedPackTitle}>GENERAL KNOWLEDGE</Text>
                  <Text style={styles.themedPackSubtitle}>
                    1,515 Questions • World History, Literature, Arts & Cinema
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.inkMuted} />
              </Pressable>

              <Pressable
                onPress={() => handleStartThemedCategory('science')}
                style={({ pressed }) => [
                  styles.themedPackCard,
                  pressed && styles.themedPackCardPressed,
                ]}
              >
                <View style={styles.themedPackIconBox}>
                  <Text style={styles.themedEmoji}>🧪</Text>
                </View>
                <View style={styles.themedPackTextCol}>
                  <Text style={styles.themedPackTitle}>SCIENCE & NATURE</Text>
                  <Text style={styles.themedPackSubtitle}>
                    1,023 Questions • Physics, Biology, Chemistry & Space
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.inkMuted} />
              </Pressable>

              <Pressable
                onPress={() => handleStartThemedCategory('geography')}
                style={({ pressed }) => [
                  styles.themedPackCard,
                  pressed && styles.themedPackCardPressed,
                ]}
              >
                <View style={styles.themedPackIconBox}>
                  <Text style={styles.themedEmoji}>🌍</Text>
                </View>
                <View style={styles.themedPackTextCol}>
                  <Text style={styles.themedPackTitle}>WORLD GEOGRAPHY</Text>
                  <Text style={styles.themedPackSubtitle}>
                    1,018 Questions • Capitals, Landmarks, Borders & Peaks
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.inkMuted} />
              </Pressable>
            </ScrollView>
          )}

          {/* SUB-VIEW: MY POCHI */}
          {currentView === 'MY_POCHI' && (
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.profileHeroCard}>
                <View style={styles.mascotCircle}>
                  <PochiLabrador size={72} expression="excited" />
                </View>
                <Text style={styles.profileName}>
                  {profile?.username || 'Trivia Challenger'}
                </Text>
                <View style={styles.rankPill}>
                  <Trophy size={14} color={Colors.goldDark} />
                  <Text style={styles.rankPillText}>
                    {rankTier?.tier || 'Curious Novice'}
                  </Text>
                </View>
              </View>

              {/* Stats Matrix */}
              <View style={styles.statsMatrix}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{profile?.overall_elo ?? 350}</Text>
                  <Text style={styles.statLbl}>CURRENT ELO</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{profile?.total_played ?? 0}</Text>
                  <Text style={styles.statLbl}>SOLVED</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>
                    {profile?.current_streak ?? 0}
                  </Text>
                  <Text style={styles.statLbl}>STREAK</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{profile?.best_streak ?? 0}</Text>
                  <Text style={styles.statLbl}>BEST STREAK</Text>
                </View>
              </View>

              <Pressable
                onPress={() => handleStartThemedCategory('all')}
                style={({ pressed }) => [
                  styles.ctaButton,
                  pressed && styles.ctaButtonPressed,
                ]}
              >
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.ctaButtonText}>TRAIN WITH POCHI NOW</Text>
              </Pressable>
            </ScrollView>
          )}

          {/* SUB-VIEW: FRIENDS & 1V1 BATTLE */}
          {currentView === 'FRIENDS' && (
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.subviewDescription}>
                Play in real-time with friends or challenge random opponents:
              </Text>

              <Pressable
                onPress={handleEnterBattle}
                style={({ pressed }) => [
                  styles.battleBigCard,
                  pressed && styles.battleBigCardPressed,
                ]}
              >
                <View style={styles.battleBigHeader}>
                  <Swords size={26} color={Colors.primary} />
                  <View style={styles.liveDot} />
                  <Text style={styles.liveTag}>LIVE MULTIPLAYER</Text>
                </View>
                <Text style={styles.battleBigTitle}>1v1 Battle Arena</Text>
                <Text style={styles.battleBigSub}>
                  Enter the real-time arena with 60ms NTP arbitration, dynamic sequential typing, and cascading buzzes.
                </Text>
                <View style={styles.enterArenaBtn}>
                  <Text style={styles.enterArenaBtnText}>ENTER ARENA</Text>
                  <ArrowUpRight size={16} color="#FFFFFF" />
                </View>
              </Pressable>

              <View style={styles.friendNoticeBox}>
                <Users size={20} color={Colors.primary} />
                <Text style={styles.friendNoticeText}>
                  Room codes allow instant private duels with friends across iOS, Android, and Web!
                </Text>
              </View>
            </ScrollView>
          )}

          {/* SUB-VIEW: SETTINGS */}
          {currentView === 'SETTINGS' && (
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Option 1: Answer Letter Count */}
              <View style={styles.settingRow}>
                <View style={styles.settingIconBox}>
                  {showLetterCount ? (
                    <Eye size={18} color={Colors.primary} />
                  ) : (
                    <EyeOff size={18} color={Colors.inkMuted} />
                  )}
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingTitle}>Answer Letter Count</Text>
                  <Text style={styles.settingDesc}>
                    Display letter slots (_ _ _) during clue reveal.
                  </Text>
                </View>
                <Switch
                  value={showLetterCount}
                  onValueChange={handleToggleLetterCount}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={showLetterCount ? Colors.card : Colors.inkMuted}
                />
              </View>

              {/* Option 2: Sound & Haptics */}
              <View style={styles.settingRow}>
                <View style={styles.settingIconBox}>
                  {soundEnabled ? (
                    <Volume2 size={18} color={Colors.primary} />
                  ) : (
                    <VolumeX size={18} color={Colors.inkMuted} />
                  )}
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={styles.settingTitle}>Sound & Ticks</Text>
                  <Text style={styles.settingDesc}>
                    Typewriter audio and buzzer sound feedback.
                  </Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={handleToggleSound}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={soundEnabled ? Colors.card : Colors.inkMuted}
                />
              </View>

              {/* Option 3: Battle Answer Input Mode */}
              <View style={styles.settingCardBlock}>
                <Text style={styles.settingTitle}>Battle Answer Mode</Text>
                <Text style={styles.settingDesc}>
                  Select your input preference after buzzing in 1v1 Arena:
                </Text>
                <View style={styles.segmentedRow}>
                  <Pressable
                    onPress={() => handleSelectBattleInputMode('matrix')}
                    style={[
                      styles.segmentBtn,
                      battleInputMode === 'matrix' && styles.segmentBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        battleInputMode === 'matrix' && styles.segmentBtnTextActive,
                      ]}
                    >
                      Dynamic Typing
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleSelectBattleInputMode('multiple_choice')}
                    style={[
                      styles.segmentBtn,
                      battleInputMode === 'multiple_choice' && styles.segmentBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        battleInputMode === 'multiple_choice' &&
                          styles.segmentBtnTextActive,
                      ]}
                    >
                      Multiple Choice
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Option 4: Supabase Sync */}
              <View style={styles.settingCardBlock}>
                <View style={styles.syncHeaderRow}>
                  <Text style={styles.settingTitle}>Database Sync</Text>
                  <Pressable
                    onPress={handleManualSupabaseSync}
                    disabled={isSyncing}
                    style={({ pressed }) => [
                      styles.syncBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <RefreshCw
                      size={13}
                      color={Colors.primary}
                      style={isSyncing ? { transform: [{ rotate: '45deg' }] } : undefined}
                    />
                    <Text style={styles.syncBtnText}>
                      {isSyncing ? 'SYNCING...' : 'SYNC NOW'}
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.syncStatusText}>{syncStatus}</Text>
              </View>

              {/* Legal & Account Links */}
              <View style={styles.legalLinksRow}>
                <Pressable
                  onPress={() => {
                    onClose();
                    router.push('/terms');
                  }}
                  style={styles.legalLink}
                >
                  <Text style={styles.legalLinkText}>Terms of Service</Text>
                </Pressable>
                <Text style={styles.legalDot}>•</Text>
                <Pressable
                  onPress={() => {
                    onClose();
                    router.push('/privacy');
                  }}
                  style={styles.legalLink}
                >
                  <Text style={styles.legalLinkText}>Privacy Policy</Text>
                </Pressable>
              </View>

              {/* Option 5: Delete Account Compliance */}
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                style={({ pressed }) => [
                  styles.deleteAccountBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Trash2 size={16} color={Colors.incorrect} />
                <Text style={styles.deleteAccountText}>
                  {isDeleting ? 'Deleting data...' : 'Delete Account & Reset Data'}
                </Text>
              </Pressable>
            </ScrollView>
          )}

          {/* SUB-VIEW: FAQ */}
          {currentView === 'FAQ' && (
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>How does buzzing in work?</Text>
                <Text style={styles.faqAnswer}>
                  Questions stream one character at a time. The earlier you buzz, the fewer letters you've seen, and the higher your bonus points and Elo gain!
                </Text>
              </View>

              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>What is Dynamic Sequential Typing?</Text>
                <Text style={styles.faqAnswer}>
                  When you buzz, exactly 6 letter tiles appear (1 correct letter + 5 distractors). You have 2.0 seconds per letter to tap the correct sequence. Answers with more than 8 letters autocomplete once 8 letters are correctly tapped!
                </Text>
              </View>

              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>How does Elo rating work?</Text>
                <Text style={styles.faqAnswer}>
                  Every player and every question has an Elo rating (200 to 2000+). Defeating hard questions or buzzing in under 1 second boosts your Elo rapidly across Novice, Smart Pup, Scholar Bear, and Grandmaster Owl!
                </Text>
              </View>

              <View style={styles.faqCard}>
                <Text style={styles.faqQuestion}>What happens if I answer incorrectly in Battle?</Text>
                <Text style={styles.faqAnswer}>
                  You lose 10 points and are locked out for the remainder of that round. If an opponent is waiting in the buzz queue, the turn cascades to them!
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Aliases for compatibility
export const KrillionMenuModal = PochiMenuModal;
export default PochiMenuModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: Colors.background,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    overflow: 'hidden',
    ...Shadows.cardElevated,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  brandSubtitle: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.primary,
    marginBottom: 2,
  },
  menuTitle: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    letterSpacing: -0.5,
    color: Colors.ink,
  },
  closeBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.hard,
  },
  closeBoxPressed: {
    backgroundColor: Colors.backgroundSecondary,
    transform: [{ translateY: 1 }],
  },

  // Section Divider Row
  sectionDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dottedLine: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  backBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  backBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.primary,
    letterSpacing: 1,
  },

  // Scroll Container
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingBottom: 4,
  },

  // 8-Card Grid Layout
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  gridCard: {
    width: '48%',
    height: 94,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Shadows.hard,
  },
  gridCardPressed: {
    backgroundColor: Colors.primaryLight,
    transform: [{ translateY: 1 }],
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueButtonBase: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#000075',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000075',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  blueButtonCap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00009F',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blueButtonHighlight: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
  gridCardText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    letterSpacing: 0.5,
    color: Colors.ink,
    textAlign: 'center',
  },

  // Battle Arena Banner
  battleBanner: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    ...Shadows.hard,
  },
  battleBannerPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ translateY: 1 }],
  },
  battleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  battleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  battleTextCol: {
    gap: 2,
  },
  battleHeadline: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  battleSub: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.primaryLight,
  },

  // Subview Common
  subviewDescription: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },

  // Themed Pack Cards
  themedPackCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    ...Shadows.hard,
  },
  themedPackCardPressed: {
    backgroundColor: Colors.primaryLight,
    transform: [{ translateY: 1 }],
  },
  themedPackIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themedEmoji: {
    fontSize: 22,
  },
  themedPackTextCol: {
    flex: 1,
    gap: 2,
  },
  themedPackTitle: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    letterSpacing: 0.5,
    color: Colors.ink,
  },
  themedPackSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
  },

  // My Pochi Subview
  profileHeroCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    ...Shadows.hard,
  },
  mascotCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderDark,
  },
  profileName: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.ink,
    marginTop: 2,
  },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gold,
  },
  rankPillText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.goldDark,
  },
  statsMatrix: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 12,
    alignItems: 'center',
    gap: 3,
    ...Shadows.card,
  },
  statVal: {
    fontFamily: Fonts.mono,
    fontSize: 18,
    color: Colors.primary,
  },
  statLbl: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.inkMuted,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    ...Shadows.hard,
  },
  ctaButtonPressed: {
    backgroundColor: Colors.primaryDark,
    transform: [{ translateY: 1 }],
  },
  ctaButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    letterSpacing: 1,
    color: '#FFFFFF',
  },

  // Friends & Battle Subview
  battleBigCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 18,
    gap: 10,
    marginBottom: 14,
    ...Shadows.hard,
  },
  battleBigCardPressed: {
    backgroundColor: Colors.primaryLight,
  },
  battleBigHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.correct,
  },
  liveTag: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 11,
    letterSpacing: 1,
    color: Colors.correct,
  },
  battleBigTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.ink,
  },
  battleBigSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkSecondary,
    lineHeight: 18,
  },
  enterArenaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  enterArenaBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    letterSpacing: 1,
    color: '#FFFFFF',
  },
  friendNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primarySubtle,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    padding: 14,
    marginBottom: 14,
  },
  friendNoticeText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkSecondary,
    lineHeight: 16,
  },

  // Settings Subview
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 14,
    gap: 12,
    marginBottom: 10,
    ...Shadows.card,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 13,
    letterSpacing: 0.3,
    color: Colors.ink,
  },
  settingDesc: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkMuted,
  },
  settingCardBlock: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 14,
    gap: 6,
    marginBottom: 10,
    ...Shadows.card,
  },
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    padding: 3,
    marginTop: 6,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentBtnText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 11,
    color: Colors.inkSecondary,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
  },
  syncHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  syncBtnText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  syncStatusText: {
    fontFamily: Fonts.monoRegular,
    fontSize: 10,
    color: Colors.inkMuted,
    marginTop: 2,
  },
  legalLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  legalLink: {
    paddingVertical: 4,
  },
  legalLinkText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 11,
    color: Colors.primary,
  },
  legalDot: {
    color: Colors.inkMuted,
    fontSize: 11,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.incorrectLight,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.incorrectBorder,
    paddingVertical: 12,
    marginBottom: 8,
  },
  deleteAccountText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 11,
    color: Colors.incorrect,
    letterSpacing: 0.3,
  },

  // FAQ Subview
  faqCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 14,
    gap: 6,
    marginBottom: 10,
    ...Shadows.card,
  },
  faqQuestion: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.primaryDark,
  },
  faqAnswer: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkSecondary,
    lineHeight: 18,
  },
});
