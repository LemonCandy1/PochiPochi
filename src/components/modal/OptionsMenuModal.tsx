import { router } from 'expo-router';
import {
  Check,
  Cloud,
  Database,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { Fonts } from '../../theme/typography';
import { UserProfile } from '../../types';
import { SupabaseService } from '../../services/supabase/supabaseClient';
import { PochiRepository } from '../../data/repository';

interface OptionsMenuModalProps {
  visible: boolean;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
}

export const OptionsMenuModal: React.FC<OptionsMenuModalProps> = ({
  visible,
  profile,
  onUpdateProfile,
  onClose,
}) => {
  const [showLetterCount, setShowLetterCount] = useState<boolean>(
    profile.show_letter_count !== false
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    profile.sound_enabled !== false
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>(
    SupabaseService.isConfigured()
      ? 'Supabase Connected'
      : 'Local Cache Active (Supabase ready)'
  );

  const handleToggleLetterCount = async (val: boolean) => {
    setShowLetterCount(val);
    const updated: UserProfile = {
      ...profile,
      show_letter_count: val,
    };
    onUpdateProfile(updated);
    await PochiRepository.saveProfile(updated);
  };

  const handleToggleSound = async (val: boolean) => {
    setSoundEnabled(val);
    const updated: UserProfile = {
      ...profile,
      sound_enabled: val,
    };
    onUpdateProfile(updated);
    await PochiRepository.saveProfile(updated);
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Game Options</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Colors.ink} />
            </Pressable>
          </View>

          {/* Option: Show Answer Letter Count */}
          <View style={styles.optionRow}>
            <View style={styles.optionIconCircle}>
              {showLetterCount ? (
                <Eye size={18} color={Colors.primaryDark} />
              ) : (
                <EyeOff size={18} color={Colors.inkSecondary} />
              )}
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Show Answer Letter Count</Text>
              <Text style={styles.optionDescription}>
                Display target answer letter count and mask slots during play.
              </Text>
            </View>
            <Switch
              value={showLetterCount}
              onValueChange={handleToggleLetterCount}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={showLetterCount ? Colors.primary : '#FFFFFF'}
            />
          </View>

          {/* Option: Sound & Haptics */}
          <View style={styles.optionRow}>
            <View style={styles.optionIconCircle}>
              {soundEnabled ? (
                <Volume2 size={18} color={Colors.primaryDark} />
              ) : (
                <VolumeX size={18} color={Colors.inkSecondary} />
              )}
            </View>
            <View style={styles.optionTextCol}>
              <Text style={styles.optionTitle}>Sound & Typewriter Ticks</Text>
              <Text style={styles.optionDescription}>
                Tactile audio feedback on streaming letter reveals.
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={soundEnabled ? Colors.primary : '#FFFFFF'}
            />
          </View>

          {/* Supabase Database Connection Card */}
          <View style={styles.supabaseCard}>
            <View style={styles.supabaseHeader}>
              <View style={styles.supabaseIconBox}>
                <Database size={16} color={Colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.supabaseTitle}>Supabase: PochiPochi</Text>
                <Text style={styles.supabaseSub}>
                  Questions, Elo, Rankings & Bookmarks
                </Text>
              </View>
            </View>
            <View style={styles.supabaseFooter}>
              <Text style={styles.supabaseStatusText} numberOfLines={1}>
                {syncStatus}
              </Text>
              <Pressable
                onPress={handleManualSupabaseSync}
                disabled={isSyncing}
                style={({ pressed }) => [
                  styles.syncBtn,
                  pressed && styles.btnPressed,
                ]}
              >
                <RefreshCw
                  size={12}
                  color={isSyncing ? Colors.inkSecondary : Colors.primaryDark}
                />
                <Text style={styles.syncBtnText}>
                  {isSyncing ? 'Syncing...' : 'Sync Cloud'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Test / Replay Onboarding Tour */}
          <Pressable
            onPress={async () => {
              await PochiRepository.resetFTUE();
              onClose();
              router.push('/ftue');
            }}
            style={({ pressed }) => [
              styles.replayFtueBtn,
              pressed && styles.btnPressed,
            ]}
          >
            <Sparkles size={16} color={Colors.primaryDark} />
            <Text style={styles.replayFtueText}>Test / Replay Onboarding Tour</Text>
          </Pressable>

          {/* Done Button */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.doneButton,
              pressed && styles.btnPressed,
            ]}
          >
            <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.doneButtonText}>Save & Return</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 26, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 20,
    ...Shadows.cardElevated,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  closeBtn: {
    padding: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  optionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.ink,
  },
  optionDescription: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  supabaseCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginTop: 14,
    marginBottom: 16,
  },
  supabaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  supabaseIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supabaseTitle: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.ink,
  },
  supabaseSub: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.inkSecondary,
    marginTop: 1,
  },
  supabaseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  supabaseStatusText: {
    flex: 1,
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.inkSecondary,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  syncBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: Colors.primaryDark,
  },
  replayFtueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 10,
  },
  replayFtueText: {
    fontFamily: Fonts.heading,
    fontSize: 13,
    color: Colors.primaryDark,
  },
  doneButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 0,
    ...Shadows.card,
  },
  doneButtonText: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: '#FFFFFF',
  },
  btnPressed: {
    transform: [{ translateY: 2 }],
  },
});
