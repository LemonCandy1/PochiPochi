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
import { ArrowLeft, BookOpen } from 'lucide-react-native';
import { Colors, Shadows } from '../src/theme/colors';
import { Fonts } from '../src/theme/typography';

export default function TermsOfServiceScreen() {
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <Text style={styles.headerSub}>RULES OF ENGAGEMENT & FAIR PLAY</Text>
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
            <BookOpen size={28} color={Colors.goldDark} />
          </View>
          <Text style={styles.heroTitle}>Fair Play & Arena Rules</Text>
          <Text style={styles.heroDescription}>
            Welcome to PochiPochi. By accessing or playing our solo and 1v1 battle modes, you agree to abide by these terms to ensure a fair, friendly, and fun community.
          </Text>
          <Text style={styles.effectiveDate}>Effective Date: September 2026</Text>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>1. Fair Play & Anti-Cheat</Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Hardware Clock Synchronization:</Text> Real-time battles enforce Network Time Protocol (NTP) clock synchronization and sliding jitter arbitration to guarantee millisecond-level precision for all buzzer presses.
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Physical Reaction Validation:</Text> Buzzes executed faster than the physiological human reaction threshold (120ms from clue start) are flagged by the server as premature automation and penalized.
          </Text>
          <Text style={styles.paragraph}>
            • <Text style={styles.bold}>Prohibited Conduct:</Text> Reverse-engineering WebSocket packets, spoofing client timestamps, running automated keystroke scripts, or exploiting network latency is strictly prohibited.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>2. Player Names & Conduct</Text>
          <Text style={styles.paragraph}>
            Players may select a custom display name. Display names that contain hate speech, harassment, impersonation, or offensive language may be reset or blocked from public matchmaking.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>3. Trivia Content & Disclaimers</Text>
          <Text style={styles.paragraph}>
            Questions and educational references in PochiPochi are curated for general knowledge and educational enrichment. While we strive for factual accuracy, PochiPochi is provided "as is" without warranty of any kind.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>4. Termination & Service Modifications</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify room rules, rotate question pools, adjust ranking algorithms, or suspend accounts that violate fair play terms.
          </Text>
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
    backgroundColor: Colors.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gold,
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
});
