import { Award, Crown, Flame, Medal, Trophy } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  OwlProfessor,
  PochiLabrador,
} from '../../src/components/mascot/MascotVectors';
import {
  RankCuriousNoviceIcon,
  RankMasterCatIcon,
  RankScholarBearIcon,
} from '../../src/components/icons/CategoryIcons';
import { PochiRepository } from '../../src/data/repository';
import { getEloRankTier } from '../../src/engine/eloEngine';
import { Colors } from '../../src/theme/colors';
import { UserProfile } from '../../src/types';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  elo: number;
  streak: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadLeaderboardData = useCallback(async () => {
    const user = await PochiRepository.getProfile();
    setProfile(user);
    const ranks = await PochiRepository.getLeaderboard();
    setEntries(ranks);
  }, []);

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };

  const userElo = profile?.overall_elo ?? 1200;
  const rankTier = getEloRankTier(userElo);
  const topChampion = entries[0] ?? {
    username: 'PochiMaster_99',
    avatar: 'dog',
    elo: 2150,
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.header}>
        <Text style={styles.title}>Trivia Champions</Text>
        <Text style={styles.subtitle}>HALL OF FAME • ELO RANKINGS</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => `rank-${item.rank}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primaryDark]}
            tintColor={Colors.primaryDark}
          />
        }
        ListHeaderComponent={() => (
          <>
            {/* Top Podium */}
            <View style={styles.podiumCard}>
              <View style={styles.crownRow}>
                <Crown size={32} color={Colors.gold} fill={Colors.gold} />
              </View>
              <View style={styles.championAvatarCircle}>
                <PochiLabrador size={64} expression="excited" />
              </View>
              <Text style={styles.championTitle}>Current No. 1 Champion</Text>
              <Text style={styles.championName}>{topChampion.username}</Text>
              <View style={styles.championPill}>
                <Trophy size={14} color={Colors.gold} />
                <Text style={styles.championElo}>{topChampion.elo.toLocaleString()} ELO</Text>
              </View>
            </View>

            {/* User Personal Stat Card */}
            <View style={styles.myStatCard}>
              <View style={styles.myStatLeft}>
                <Text style={styles.myRankBadge}>YOUR STANDING</Text>
                <Text style={styles.myRankTitle}>{rankTier.tier}</Text>
                <Text style={styles.myRankSub}>
                  Best Streak: {profile?.best_streak ?? 0} • Total Played:{' '}
                  {profile?.total_played ?? 0}
                </Text>
              </View>
              <View style={styles.myStatRight}>
                <Text style={styles.myStatElo}>{userElo}</Text>
                <Text style={styles.myStatEloLabel}>ELO</Text>
              </View>
            </View>

            {/* Category Elo Breakdown */}
            <View style={styles.categoryEloSection}>
              <Text style={styles.categoryEloHeader}>Category Proficiencies</Text>
              <View style={styles.categoryEloGrid}>
                {profile &&
                  Object.entries(profile.category_elos).map(([cat, val]) => (
                    <View key={cat} style={styles.catPill}>
                      <Text style={styles.catPillLabel}>
                        {cat.toUpperCase()}
                      </Text>
                      <Text style={styles.catPillVal}>{val}</Text>
                    </View>
                  ))}
              </View>
            </View>

            <Text style={styles.rosterHeader}>Global Ranks</Text>
          </>
        )}
        renderItem={({ item }) => {
          return (
            <View
              style={[
                styles.rankRow,
                item.isCurrentUser && styles.rankRowCurrentUser,
              ]}
            >
              {/* Rank Index */}
              <View style={styles.rankBadge}>
                {item.rank === 1 && (
                  <Medal size={20} color={Colors.gold} fill={Colors.gold} />
                )}
                {item.rank === 2 && (
                  <Medal size={20} color="#94A3B8" fill="#94A3B8" />
                )}
                {item.rank === 3 && (
                  <Medal size={20} color="#D97706" fill="#D97706" />
                )}
                {item.rank > 3 && (
                  <Text style={styles.rankNumberText}>{item.rank}</Text>
                )}
              </View>

              {/* Avatar Icon */}
              <View style={styles.userAvatar}>
                {item.avatar === 'dog' && (
                  <PochiLabrador size={30} expression="happy" />
                )}
                {item.avatar === 'owl' && <OwlProfessor size={28} />}
                {item.avatar === 'cat' && <RankMasterCatIcon size={24} />}
                {item.avatar === 'bear' && <RankScholarBearIcon size={24} />}
                {item.avatar !== 'dog' &&
                  item.avatar !== 'owl' &&
                  item.avatar !== 'cat' &&
                  item.avatar !== 'bear' && (
                    <RankCuriousNoviceIcon size={22} color={Colors.primary} />
                  )}
              </View>

              {/* User Handle */}
              <View style={styles.userMeta}>
                <Text
                  style={[
                    styles.userName,
                    item.isCurrentUser && styles.userNameCurrent,
                  ]}
                >
                  {item.username} {item.isCurrentUser && '(You)'}
                </Text>
                <View style={styles.streakBadge}>
                  <Flame size={12} color="#EF4444" fill="#EF4444" />
                  <Text style={styles.streakText}>{item.streak} streak</Text>
                </View>
              </View>

              {/* Elo Score */}
              <View style={styles.eloBox}>
                <Text style={styles.eloScore}>{item.elo}</Text>
                <Text style={styles.eloUnit}>ELO</Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  listContent: {
    padding: 20,
    gap: 10,
  },
  podiumCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: Colors.borderDark,
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  crownRow: {
    marginBottom: 6,
  },
  championAvatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  championTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#BFDBFE',
    letterSpacing: 1,
  },
  championName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  championPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
    marginTop: 8,
  },
  championElo: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  myStatCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: Colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  myStatLeft: {
    flex: 1,
  },
  myRankBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  myRankTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.ink,
    marginTop: 2,
  },
  myRankSub: {
    fontSize: 11,
    color: Colors.inkSecondary,
    marginTop: 4,
  },
  myStatRight: {
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  myStatElo: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  myStatEloLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.inkSecondary,
  },
  categoryEloSection: {
    marginBottom: 16,
  },
  categoryEloHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.inkSecondary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  categoryEloGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  catPill: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  catPillLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.inkSecondary,
  },
  catPillVal: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.primaryDark,
    marginTop: 2,
  },
  rosterHeader: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.ink,
    marginBottom: 6,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: Colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  },
  rankRowCurrentUser: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryDark,
  },
  rankBadge: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.inkSecondary,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.cardSubtle,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  userMeta: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.ink,
  },
  userNameCurrent: {
    color: Colors.primaryDark,
    fontWeight: '900',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  streakText: {
    fontSize: 10,
    color: Colors.inkSecondary,
    fontWeight: '700',
  },
  eloBox: {
    alignItems: 'flex-end',
  },
  eloScore: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primaryDark,
  },
  eloUnit: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.inkSecondary,
  },
});
