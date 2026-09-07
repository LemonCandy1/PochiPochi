import { router } from 'expo-router';
import {
  BookOpen,
  Clock,
  Compass,
  Database,
  FlaskConical,
  Play,
  RefreshCw,
  Settings,
  Zap,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PochiLabrador } from '../../src/components/mascot/MascotVectors';
import {
  CategoryIcon,
  RankBadgeIcon,
  StreakFlameIcon,
} from '../../src/components/icons/CategoryIcons';
import { CATEGORIES } from '../../src/data/questions';
import { PochiRepository } from '../../src/data/repository';
import { getEloRankTier } from '../../src/engine/eloEngine';
import { Colors, Shadows } from '../../src/theme/colors';
import { Fonts } from '../../src/theme/typography';
import { Category, UserProfile } from '../../src/types';
import { OptionsMenuModal } from '../../src/components/modal/OptionsMenuModal';

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState<boolean>(false);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('J! Archive & TriviaQA ready');

  useEffect(() => {
    PochiRepository.getProfile().then(setProfile);
    PochiRepository.getQuestions().then((qs) => {
      setQuestionCount(qs.length);
      // Background sync from API
      PochiRepository.syncExternalQuestions('all', 10)
        .then((res) => {
          setQuestionCount(res.total);
          setSyncStatus(`Connected • ${res.total} clues loaded`);
        })
        .catch(() => {
          setSyncStatus(`Offline mode • ${qs.length} clues loaded`);
        });
    });
  }, []);

  const handleSyncApi = async () => {
    setIsSyncing(true);
    setSyncStatus('Fetching from J! Archive API...');
    try {
      const res = await PochiRepository.syncExternalQuestions('all', 10);
      setQuestionCount(res.total);
      setSyncStatus(`Synced: ${res.total} total clues (+${res.added} new)`);
    } catch {
      setSyncStatus('Endpoint unavailable, using local clues');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleStartGame = (category: Category | 'all') => {
    router.push({
      pathname: '/(tabs)/play',
      params: { category },
    });
  };

  const rankTier = profile ? getEloRankTier(profile.overall_elo) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>PochiPochi</Text>
            <Text style={styles.appSubtitle}>RAPID PROGRESSIVE TRIVIA</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.eloPill}>
              <Text style={styles.eloNumber}>{profile?.overall_elo ?? 1200}</Text>
              <Text style={styles.eloText}>ELO</Text>
            </View>
            <Pressable
              onPress={() => setOptionsModalVisible(true)}
              style={({ pressed }) => [
                styles.settingsBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Settings size={20} color={Colors.ink} />
            </Pressable>
            <View style={styles.avatarCircle}>
              <PochiLabrador size={38} expression="happy" />
            </View>
          </View>
        </View>

        {/* Daily Ticking Challenge Banner (from prototype) */}
        <View style={styles.dailyCard}>
          <View style={styles.dailyLeft}>
            <View style={styles.dailyBadge}>
              <Clock size={14} color="#FFFFFF" />
              <Text style={styles.dailyBadgeText}>DAILY TRIVIA</Text>
            </View>
            <Text style={styles.dailyHeadline}>Today's Speed Teaser</Text>
            <Text style={styles.dailySub}>
              Buzz early for maximum bonus Elo!
            </Text>
            <Pressable
              onPress={() => handleStartGame('all')}
              style={({ pressed }) => [
                styles.dailyButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.dailyButtonText}>Start Today's Quiz</Text>
              <Play size={14} color={Colors.primaryDark} fill={Colors.primaryDark} />
            </Pressable>
          </View>
          <View style={styles.dailyClockBox}>
            <View style={styles.clockIconCircle}>
              <Clock size={32} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.timerText}>14:28:09</Text>
            <Text style={styles.timerLabel}>RESETS IN</Text>
          </View>
        </View>

        {/* Endless Quick Play CTA */}
        <Pressable
          onPress={() => handleStartGame('all')}
          style={({ pressed }) => [
            styles.endlessCard,
            pressed && styles.buttonPressed,
          ]}
        >
          <View style={styles.endlessContent}>
            <View style={styles.endlessIconBadge}>
              <Zap size={22} color={Colors.primary} fill={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.endlessTitle}>All-Mix Endless Mode</Text>
              <Text style={styles.endlessSub}>
                Continuous speed progression across all subjects
              </Text>
            </View>
          </View>
          <View style={styles.mascotPeek}>
            <PochiLabrador size={64} expression="excited" />
          </View>
        </Pressable>


        {/* Categories */}
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => handleStartGame(cat.id)}
              style={({ pressed }) => [
                styles.categoryCard,
                pressed && styles.categoryCardPressed,
              ]}
            >
              <View style={styles.catIconCircle}>
                <CategoryIcon category={cat.id} size={36} />
              </View>
              <Text style={styles.catTitle}>{cat.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Bulk Dataset Connection Card (J! Archive & TriviaQA) */}
        <View style={styles.datasetCard}>
          <View style={styles.datasetHeader}>
            <View style={styles.datasetIconBox}>
              <Database size={18} color={Colors.primaryDark} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.datasetTitle}>Open Trivia Datasets</Text>
              <Text style={styles.datasetSub}>
                J! Archive (40+ seasons, $200-$2000) & TriviaQA
              </Text>
            </View>
            <View style={styles.datasetBadge}>
              <Text style={styles.datasetBadgeText}>{questionCount} CLUES</Text>
            </View>
          </View>
          <View style={styles.datasetFooter}>
            <Text style={styles.datasetStatusText} numberOfLines={1}>
              {syncStatus}
            </Text>
            <Pressable
              onPress={handleSyncApi}
              disabled={isSyncing}
              style={({ pressed }) => [
                styles.datasetSyncButton,
                isSyncing && styles.syncingButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <RefreshCw
                size={12}
                color={isSyncing ? Colors.inkSecondary : Colors.primaryDark}
              />
              <Text
                style={[
                  styles.datasetSyncText,
                  isSyncing && styles.syncingText,
                ]}
              >
                {isSyncing ? 'Syncing...' : 'Sync Clues'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Streak & Rank Status Footer */}
        <View style={styles.statusFooter}>
          <View style={styles.statusCol}>
            <Text style={styles.statusLabel}>CURRENT STREAK</Text>
            <View style={styles.streakStatusRow}>
              <StreakFlameIcon size={16} />
              <Text style={styles.statusVal}>
                {profile?.current_streak ?? 0}
              </Text>
            </View>
          </View>
          <View style={styles.statusDivider} />
          <View style={styles.statusCol}>
            <Text style={styles.statusLabel}>RANK TIER</Text>
            <View style={styles.rankStatusRow}>
              <RankBadgeIcon badgeId={rankTier?.badgeId} size={18} />
              <Text style={styles.statusVal}>
                {rankTier?.tier}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Game Options & Cloud Sync Modal */}
      {profile && (
        <OptionsMenuModal
          visible={optionsModalVisible}
          profile={profile}
          onUpdateProfile={(updated) => setProfile(updated)}
          onClose={() => setOptionsModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  appTitle: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    letterSpacing: 1.5,
    color: Colors.primaryDark,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eloPill: {
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    ...Shadows.card,
  },
  eloNumber: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: Colors.primaryDark,
  },
  eloText: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    color: Colors.inkSecondary,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.card,
  },
  dailyCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderWidth: 0,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    ...Shadows.cardElevated,
  },
  dailyLeft: {
    flex: 1,
    paddingRight: 10,
  },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
    marginBottom: 8,
  },
  dailyBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  dailyHeadline: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  dailySub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.primaryLight,
    marginTop: 4,
    marginBottom: 12,
  },
  dailyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
    borderWidth: 0,
    ...Shadows.card,
  },
  dailyButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  dailyClockBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clockIconCircle: {
    marginBottom: 4,
  },
  timerText: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  timerLabel: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    color: Colors.primaryLight,
    letterSpacing: 1,
    marginTop: 2,
  },
  endlessCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.card,
  },
  endlessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  endlessIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endlessTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.ink,
  },
  endlessSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.inkSecondary,
    marginTop: 2,
  },
  mascotPeek: {
    marginLeft: 6,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...Shadows.card,
  },
  categoryCardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
  catIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.cardSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catTitle: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.ink,
    textAlign: 'center',
  },

  statusFooter: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginTop: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...Shadows.card,
  },
  statusCol: {
    alignItems: 'center',
  },
  streakStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: {
    fontFamily: Fonts.heading,
    fontSize: 9,
    color: Colors.inkSecondary,
    letterSpacing: 1,
    marginBottom: 3,
  },
  statusVal: {
    fontFamily: Fonts.mono,
    fontSize: 15,
    color: Colors.ink,
  },
  statusDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
  },
  datasetCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginTop: 20,
  },
  datasetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  datasetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datasetTitle: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  datasetSub: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkSecondary,
    marginTop: 1,
  },
  datasetBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  datasetBadgeText: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: Colors.primaryDark,
    letterSpacing: 0.5,
  },
  datasetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  datasetStatusText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkSecondary,
  },
  datasetSyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  syncingButton: {
    opacity: 0.6,
  },
  datasetSyncText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.primaryDark,
  },
  syncingText: {
    color: Colors.inkSecondary,
  },
});
