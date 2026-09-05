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
  Sparkles,
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
  AnimeCategoryIcon,
  GeneralKnowledgeCategoryIcon,
  GeographyCategoryIcon,
  RankBadgeIcon,
  ScienceCategoryIcon,
  StreakFlameIcon,
} from '../../src/components/icons/CategoryIcons';
import { CATEGORIES } from '../../src/data/questions';
import { PochiRepository } from '../../src/data/repository';
import { getEloRankTier } from '../../src/engine/eloEngine';
import { Colors } from '../../src/theme/colors';
import { Category, UserProfile } from '../../src/types';

export default function HomeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
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

        {/* Categories Section (2x2 grid from prototype) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Category</Text>
          <Text style={styles.sectionJapanese}>EXPLORE</Text>
        </View>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const elo = profile?.category_elos[cat.id] ?? 1200;
            return (
              <Pressable
                key={cat.id}
                onPress={() => handleStartGame(cat.id)}
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.buttonPressed,
                ]}
              >
                <View style={styles.catIconCircle}>
                  {cat.id === 'science' && <ScienceCategoryIcon size={34} />}
                  {cat.id === 'geography' && <GeographyCategoryIcon size={34} />}
                  {cat.id === 'anime' && <AnimeCategoryIcon size={34} />}
                  {cat.id === 'general' && <GeneralKnowledgeCategoryIcon size={34} />}
                </View>
                <Text style={styles.catTitle}>{cat.label}</Text>
                <Text style={styles.catJapanese}>{cat.themeTag}</Text>
                <View style={styles.catEloRow}>
                  <Text style={styles.catEloText}>{elo} ELO</Text>
                </View>
              </Pressable>
            );
          })}
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
    fontSize: 26,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 10,
    fontWeight: '800',
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
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    alignItems: 'center',
  },
  eloNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  eloText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.inkSecondary,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dailyCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.borderDark,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
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
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  dailyHeadline: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  dailySub: {
    fontSize: 12,
    color: '#DBEAFE',
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
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
  },
  dailyButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  dailyClockBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clockIconCircle: {
    marginBottom: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  timerLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#BFDBFE',
    letterSpacing: 1,
    marginTop: 2,
  },
  endlessCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
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
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endlessTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.ink,
  },
  endlessSub: {
    fontSize: 12,
    color: Colors.inkSecondary,
    marginTop: 2,
  },
  mascotPeek: {
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.ink,
  },
  sectionJapanese: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.inkSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 14,
    alignItems: 'center',
    shadowColor: Colors.ink,
    shadowOffset: { width: 2.5, height: 2.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  catIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.cardSubtle,
    borderWidth: 1.5,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  catTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.ink,
  },
  catJapanese: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.inkSecondary,
    marginTop: 1,
  },
  catEloRow: {
    marginTop: 8,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catEloText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  statusFooter: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    marginTop: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
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
    fontSize: 9,
    fontWeight: '800',
    color: Colors.inkSecondary,
    letterSpacing: 1,
    marginBottom: 3,
  },
  statusVal: {
    fontSize: 15,
    fontWeight: '900',
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
    borderWidth: 1.5,
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
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datasetTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  datasetSub: {
    fontSize: 11,
    fontWeight: '500',
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
    fontSize: 10,
    fontWeight: '800',
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
    fontSize: 11,
    fontWeight: '600',
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
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  syncingText: {
    color: Colors.inkSecondary,
  },
});
