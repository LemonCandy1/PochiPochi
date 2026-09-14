import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { Colors, Shadows } from '../src/theme/colors';
import { Fonts } from '../src/theme/typography';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <ArrowLeft size={20} color={Colors.ink} />
        </Pressable>
        <View style={styles.headerTitleCluster}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSub}>POCHIPOCHI DATA TRANSPARENCY</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.iconCircle}>
            <ShieldCheck size={28} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroDescription}>
            PochiPochi is built for fun, fast, competitive trivia. We believe in minimal data collection, zero third-party advertising tracking, and complete user control over your data.
          </Text>
          <Text style={styles.effectiveDate}>Effective Date: September 2026</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Gameplay Telemetry:</Text> When you play solo or multiplayer battles, we record match scores, round completion timestamps, question attempt history, and category Elo ratings to provide accurate matchmaking and progress tracking.
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Device & Connection Data:</Text> When connecting to live multiplayer servers, temporary network metrics (round-trip time, clock synchronization offsets) are processed in real-time to arbitrate buzzer reaction speeds accurately.
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Authentication (Optional):</Text> If you sign in via Supabase Auth (email or OAuth), your email address is securely stored for session persistence across devices.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. How We Use Information</Text>
          <Text style={styles.paragraph}>
            • To deliver synchronized real-time 1v1 trivia battles.
          </Text>
          <Text style={styles.paragraph}>
            • To compute skill-based Elo ratings and prevent repetitive questions.
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Zero Third-Party Advertising:</Text> We do not sell, rent, or share your personal data with third-party data brokers or advertising networks.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Data Storage & Security</Text>
          <Text style={styles.paragraph}>
            Local game state (bookmarks, custom settings, streak progress) is stored on your device using encrypted storage. Cloud data is hosted securely on Supabase databases with SSL/TLS encryption in transit and at rest.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Account & Data Deletion (Apple Guideline 5.1.1)</Text>
          <Text style={styles.paragraph}>
            You have full control over your data. You may permanently delete your account, saved preferences, stats, and stored sessions at any time directly within the app:
          </Text>
          <Text style={styles.highlightText}>
            Options Menu → Game Options → Delete Account & Clear Data
          </Text>
          <Text style={styles.paragraph}>
            Initiating account deletion immediately and irreversibly wipes all local storage and terminates all active cloud sessions.
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>5. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or your data, please contact the development team at:
          </Text>
          <Text style={styles.contactEmail}>support@pochipochi.app</Text>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontFamily: Fonts.heading,
    fontSize: 17,
    color: Colors.ink,
  },
  headerSub: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '800',
    color: Colors.inkMuted,
    letterSpacing: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 10,
    ...Shadows.card,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  heroTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.ink,
  },
  heroDescription: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.inkSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  effectiveDate: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.inkMuted,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
    ...Shadows.card,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: Colors.ink,
    marginBottom: 4,
  },
  paragraph: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkSecondary,
    lineHeight: 19,
  },
  bold: {
    fontFamily: Fonts.bodyBold,
    color: Colors.ink,
  },
  highlightText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryLight,
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    marginVertical: 4,
  },
  contactEmail: {
    fontFamily: Fonts.mono,
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
});
