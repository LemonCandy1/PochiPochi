import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthService } from '../src/services/auth/googleAuth';
import { router } from 'expo-router';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Flame,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  CategoryIcon,
  SpeedLightningIcon,
  StreakFlameIcon,
} from '../src/components/icons/CategoryIcons';
import {
  GlobeTrotterBear,
  MascotCompanion,
  OtakuBunny,
  OwlProfessor,
  PochiLabrador,
} from '../src/components/mascot/MascotVectors';
import { CATEGORIES } from '../src/data/questions';
import { PochiRepository } from '../src/data/repository';
import { Colors, Shadows } from '../src/theme/colors';
import { Fonts } from '../src/theme/typography';
import {
  Category,
  CompanionType,
  FTUESessionState,
  Question,
} from '../src/types';
import { AudioHaptics } from '../src/utils/audioHaptics';

// Apple Vector Logo
const AppleVectorIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 18,
  color = '#FFFFFF',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.05-.51 2.67-1.26" />
  </Svg>
);

// Google Vector Logo
const GoogleVectorIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export default function FTUEScreen() {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 to 6
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionType>('dog');
  const [selectedCategory, setSelectedCategory] = useState<Category>('geography');

  // Screen 1: Buzzer down-press animation & state
  const buzzerAnim = useRef(new Animated.Value(0)).current;
  const [buzzerIlluminated, setBuzzerIlluminated] = useState<boolean>(false);
  const [buzzerCelebration, setBuzzerCelebration] = useState<boolean>(false);

  // Screen 4: 3-Question Solo Placement Arena state
  const [calibrationQuestions, setCalibrationQuestions] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [revealedChars, setRevealedChars] = useState<number>(1);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isBuzzed, setIsBuzzed] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [mascotReaction, setMascotReaction] = useState<'happy' | 'excited' | 'pensive'>('happy');
  const [currentSpeedMult, setCurrentSpeedMult] = useState<number>(2.0);
  const [completedResults, setCompletedResults] = useState<
    FTUESessionState['completedQuestions']
  >([]);
  const streamTimerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionPulseAnim = useRef(new Animated.Value(0)).current;

  // Screen 5: Roll-up counter & Flame Ignite
  const animatedElo = useRef(new Animated.Value(1000)).current;
  const [displayElo, setDisplayElo] = useState<number>(1000);
  const flameAnim = useRef(new Animated.Value(0)).current;
  const [expandedAccordionIndex, setExpandedAccordionIndex] = useState<number | null>(null);

  // Screen 6: Auth loading state
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);

  // Calculated Calibrated Elo
  const calibratedFinalElo = useRef<number>(1260);

  // --------------------------------------------------------------------------
  // SCREEN 1: THE TACTILE HOOK
  // --------------------------------------------------------------------------
  const handleTouchPochi = () => {
    if (buzzerIlluminated) return;
    AudioHaptics.playPochiBuzzer();
    setBuzzerIlluminated(true);
    setBuzzerCelebration(true);

    // Elastic squish
    Animated.sequence([
      Animated.timing(buzzerAnim, {
        toValue: 8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buzzerAnim, {
        toValue: 0,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-advance after 350ms as per spec
    setTimeout(() => {
      setCurrentStep(2);
    }, 380);
  };

  // --------------------------------------------------------------------------
  // SCREEN 2 -> SCREEN 3: COMPANION PICK
  // --------------------------------------------------------------------------
  const handleSelectCompanion = (comp: CompanionType) => {
    setSelectedCompanion(comp);
    AudioHaptics.playTypewriterTick();
  };

  const handleAdvanceToCategory = () => {
    AudioHaptics.playTypewriterTick();
    setCurrentStep(3);
  };

  // --------------------------------------------------------------------------
  // SCREEN 3 -> SCREEN 4: CATEGORY SELECTION & PRELOADING
  // --------------------------------------------------------------------------
  const handleSelectCategory = async (cat: Category) => {
    setSelectedCategory(cat);
    AudioHaptics.playTypewriterTick();

    // Pre-load the 3 starter questions
    const qs = await PochiRepository.getFTUEQuestions(cat);
    setCalibrationQuestions(qs);
    setQuestionIndex(0);
    setRevealedChars(1);
    setIsStreaming(true);
    setIsBuzzed(false);
    setSelectedAnswer(null);
    setMascotReaction('happy');
    startTimeRef.current = Date.now();
    setCurrentStep(4);
  };

  // --------------------------------------------------------------------------
  // SCREEN 4: 3-QUESTION MICRO-CALIBRATION ARENA
  // --------------------------------------------------------------------------
  const currentQ = calibrationQuestions[questionIndex];

  // Typewriter streaming effect (38ms per letter cadence as per spec)
  useEffect(() => {
    if (currentStep !== 4 || !currentQ || !isStreaming || isBuzzed) {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      return;
    }

    streamTimerRef.current = setInterval(() => {
      setRevealedChars((prev) => {
        if (prev >= currentQ.clue_text.length) {
          clearInterval(streamTimerRef.current);
          return prev;
        }
        const next = prev + 1;
        if (next % 5 === 0) {
          AudioHaptics.playTypewriterTick();
        }
        // Speed multiplier decay
        const ratio = next / currentQ.clue_text.length;
        const mult = Math.max(1.0, parseFloat((2.0 - ratio * 1.0).toFixed(2)));
        setCurrentSpeedMult(mult);
        return next;
      });
    }, 38);

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [currentStep, currentQ, isStreaming, isBuzzed]);

  // Pulsation animation for introductory placement questions
  useEffect(() => {
    if (currentStep === 4 && isStreaming && !isBuzzed && !selectedAnswer) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(questionPulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(questionPulseAnim, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => {
        pulseLoop.stop();
      };
    } else {
      Animated.timing(questionPulseAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, isStreaming, isBuzzed, selectedAnswer]);

  // Buzzer freeze
  const handleBuzzerFreeze = () => {
    if (isBuzzed || selectedAnswer) return;
    AudioHaptics.playPochiBuzzer();
    setIsBuzzed(true);
    setIsStreaming(false);
  };

  // Answer selection
  const handleSelectAnswerOption = (option: string) => {
    if (selectedAnswer || !currentQ) return;
    const duration = Date.now() - startTimeRef.current;
    setSelectedAnswer(option);
    setIsStreaming(false);
    setIsBuzzed(true);

    const isCorrect = option.toUpperCase() === currentQ.answer.toUpperCase();
    if (isCorrect) {
      AudioHaptics.playCorrect();
      setMascotReaction('excited');
    } else {
      AudioHaptics.playIncorrect();
      setMascotReaction('pensive');
    }

    // Record question result
    const resultItem = {
      questionId: currentQ.id,
      questionText: currentQ.clue_text,
      answer: currentQ.answer,
      wasCorrect: isCorrect,
      interruptSpeedMs: duration,
      wikiUrl: currentQ.wikipedia_url,
      contextSummary: currentQ.context_summary,
      difficultyTier: currentQ.difficulty_tier,
    };

    const nextResults = [...completedResults, resultItem];
    setCompletedResults(nextResults);

    // Auto-advance after 1.2s as per spec
    setTimeout(() => {
      if (questionIndex < 2) {
        setQuestionIndex((prev) => prev + 1);
        setRevealedChars(1);
        setIsStreaming(true);
        setIsBuzzed(false);
        setSelectedAnswer(null);
        setMascotReaction('happy');
        setCurrentSpeedMult(2.0);
        startTimeRef.current = Date.now();
      } else {
        // Calibration finished! Calculate calibrated Elo
        const correctCount = nextResults.filter((r) => r.wasCorrect).length;
        let base = 1200;
        if (correctCount === 3) base = 1260;
        else if (correctCount === 2) base = 1230;
        else if (correctCount === 1) base = 1180;
        else base = 1140;

        calibratedFinalElo.current = base;
        setCurrentStep(5);
      }
    }, 1200);
  };

  // --------------------------------------------------------------------------
  // SCREEN 5: DIAGNOSTIC ELO & STREAK REVEAL
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (currentStep !== 5) return;

    // Roll up counter animation from 1000 to calibrated Elo
    animatedElo.setValue(1000);
    const listenerId = animatedElo.addListener(({ value }) => {
      setDisplayElo(Math.round(value));
    });

    Animated.timing(animatedElo, {
      toValue: calibratedFinalElo.current,
      duration: 1600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      // Ignite streak flame after roll-up
      AudioHaptics.playCorrect();
      Animated.spring(flameAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      animatedElo.removeListener(listenerId);
    };
  }, [currentStep]);

  // Open Wikipedia deep link
  const handleOpenWikipedia = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (e) {
      console.warn('Could not open Wikipedia URL', e);
    }
  };

  // --------------------------------------------------------------------------
  // SCREEN 6: VALUE-LOCK GATE COMPLETION
  // --------------------------------------------------------------------------
  const handleCompleteFTUE = async (authMethod: 'apple' | 'google' | 'guest') => {
    const session: FTUESessionState = {
      guestId: 'guest-' + Date.now(),
      selectedCompanion,
      selectedCategory,
      calibratedElo: calibratedFinalElo.current,
      sessionStreak: 1,
      completedQuestions: completedResults,
    };

    if (authMethod === 'google') {
      // Real Google OAuth via Supabase
      setIsAuthLoading(true);
      try {
        const authRes = await GoogleAuthService.signInWithGoogle();

        if (authRes.type === 'success') {
          session.guestId = authRes.user.userId;
          const profile = await PochiRepository.completeFTUE(session, authMethod);
          const updated = {
            ...profile,
            username: authRes.user.displayName || 'PochiScholar',
            id: authRes.user.userId,
          };
          await PochiRepository.saveProfile(updated);
          AudioHaptics.playCorrect();
          router.replace('/(tabs)');
          return;
        }

        if (authRes.type === 'provider_not_enabled') {
          setIsAuthLoading(false);
          Alert.alert(
            'Google Sign-In Setup Required',
            'Google OAuth is not enabled yet in your Supabase project (ndkimouioysvlunqpdnl).\n\nTo enable real Google login:\n1. Open Supabase Dashboard > Authentication > Providers\n2. Enable "Google" and enter your Google Client ID & Secret.\n\nWould you like to sign in with a demo Google account for now, or play as guest?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Play as Guest',
                onPress: () => handleCompleteFTUE('guest'),
              },
              {
                text: 'Sign in with Google (Demo)',
                onPress: async () => {
                  const demoUser = GoogleAuthService.getDemoUser();
                  session.guestId = demoUser.userId;
                  const profile = await PochiRepository.completeFTUE(session, 'google');
                  await PochiRepository.saveProfile({
                    ...profile,
                    username: demoUser.displayName,
                    id: demoUser.userId,
                  });
                  AudioHaptics.playCorrect();
                  router.replace('/(tabs)');
                },
              },
            ]
          );
          return;
        }

        if (authRes.type === 'cancelled') {
          setIsAuthLoading(false);
          Alert.alert(
            'Sign-In Incomplete',
            'Did the sign-in window close before finishing?\n\nYou can try signing in with Google again, or continue instantly with a demo account or as a guest.',
            [
              { text: 'Try Again', style: 'cancel' },
              {
                text: 'Play as Guest',
                onPress: () => handleCompleteFTUE('guest'),
              },
              {
                text: 'Sign in (Demo Google)',
                onPress: async () => {
                  const demoUser = GoogleAuthService.getDemoUser();
                  session.guestId = demoUser.userId;
                  const profile = await PochiRepository.completeFTUE(session, 'google');
                  await PochiRepository.saveProfile({
                    ...profile,
                    username: demoUser.displayName,
                    id: demoUser.userId,
                  });
                  AudioHaptics.playCorrect();
                  router.replace('/(tabs)');
                },
              },
            ]
          );
          return;
        }

        if (authRes.type === 'error') {
          setIsAuthLoading(false);
          const errorMsg =
            authRes.message && authRes.message !== 'null'
              ? authRes.message
              : 'Google sign-in could not complete. Please check your Supabase redirect URLs or network connection.';
          Alert.alert('Google Sign-In', errorMsg, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Play as Guest',
              onPress: () => handleCompleteFTUE('guest'),
            },
          ]);
          return;
        }
      } catch (e: any) {
        console.warn('[FTUE] Google auth error:', e);
        setIsAuthLoading(false);
        const errorMsg =
          e?.message && e.message !== 'null'
            ? e.message
            : 'Could not complete Google sign-in.';
        Alert.alert(
          'Google Sign-In',
          errorMsg,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Play as Guest',
              onPress: () => handleCompleteFTUE('guest'),
            },
          ]
        );
        return;
      }
    }

    // Apple / Guest — proceed as before
    AudioHaptics.playCorrect();
    await PochiRepository.completeFTUE(session, authMethod);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* ==================================================================== */}
      {/* SCREEN 1: THE TACTILE HOOK ("Touch the Pochi")                        */}
      {/* ==================================================================== */}
      {currentStep === 1 && (
        <View style={styles.screen1Wrapper}>
          <View style={styles.screen1HeaderBlock}>
            <Text style={styles.screen1Brand}>PochiPochi</Text>
            <Text style={styles.screen1Title}>Welcome to PochiPochi.</Text>
            <Text style={styles.screen1Body}>
              Trivia moves fast. Hit the button when you know the answer.
            </Text>
          </View>

          {/* Mascot in pose */}
          <View style={styles.screen1MascotBox}>
            <PochiLabrador
              size={130}
              expression={buzzerCelebration ? 'excited' : 'happy'}
            />
          </View>

          {/* Glowing Buzzer in bottom third */}
          <View style={styles.screen1BuzzerContainer}>
            <Animated.View
              style={[
                styles.screen1BuzzerHalo,
                buzzerIlluminated && styles.screen1BuzzerHaloLit,
                { transform: [{ translateY: buzzerAnim }] },
              ]}
            >
              <Pressable
                onPress={handleTouchPochi}
                style={({ pressed }) => [
                  styles.screen1BuzzerButton,
                  buzzerIlluminated && styles.screen1BuzzerButtonLit,
                  pressed && { transform: [{ scale: 0.96 }] },
                ]}
              >
                <View style={styles.screen1BuzzerInner}>
                  <Text style={styles.screen1BuzzerText}>
                    {buzzerIlluminated ? 'BUZZED!' : 'POCHI'}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
            <Text style={styles.screen1HintText}>TAP TO TEST THE BUZZER</Text>
          </View>
        </View>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 2: CHOOSE YOUR DESK MASCOT                                   */}
      {/* ==================================================================== */}
      {currentStep === 2 && (
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepPillLabel}>COMPANION SELECTION</Text>
            <Text style={styles.stepTitle}>Choose Your Desk Mascot</Text>
            <Text style={styles.stepSub}>
              Your companion reacts to your buzzes and speed streaks.
            </Text>
          </View>

          <View style={styles.companionGrid}>
            {/* 1. Smart Labrador */}
            <Pressable
              onPress={() => handleSelectCompanion('dog')}
              style={[
                styles.companionCard,
                selectedCompanion === 'dog' && styles.companionCardActive,
              ]}
            >
              <PochiLabrador size={72} expression={selectedCompanion === 'dog' ? 'excited' : 'happy'} />
              <Text style={styles.companionName}>Smart Labrador</Text>
              <Text style={styles.companionRole}>Focused • General</Text>
            </Pressable>

            {/* 2. Globe-Trotter Bear */}
            <Pressable
              onPress={() => handleSelectCompanion('bear')}
              style={[
                styles.companionCard,
                selectedCompanion === 'bear' && styles.companionCardActive,
              ]}
            >
              <GlobeTrotterBear size={72} expression={selectedCompanion === 'bear' ? 'excited' : 'happy'} />
              <Text style={styles.companionName}>Globe Bear</Text>
              <Text style={styles.companionRole}>Curious • Geography</Text>
            </Pressable>

            {/* 3. Otaku Bunny */}
            <Pressable
              onPress={() => handleSelectCompanion('bunny')}
              style={[
                styles.companionCard,
                selectedCompanion === 'bunny' && styles.companionCardActive,
              ]}
            >
              <OtakuBunny size={72} expression={selectedCompanion === 'bunny' ? 'excited' : 'happy'} />
              <Text style={styles.companionName}>Otaku Bunny</Text>
              <Text style={styles.companionRole}>Energetic • Anime</Text>
            </Pressable>

            {/* 4. Scientist Owl */}
            <Pressable
              onPress={() => handleSelectCompanion('owl')}
              style={[
                styles.companionCard,
                selectedCompanion === 'owl' && styles.companionCardActive,
              ]}
            >
              <OwlProfessor size={72} expression={selectedCompanion === 'owl' ? 'excited' : 'happy'} />
              <Text style={styles.companionName}>Scientist Owl</Text>
              <Text style={styles.companionRole}>Analytical • STEM</Text>
            </Pressable>
          </View>

          {/* Bottom Anchored CTA */}
          <View style={styles.bottomCtaBox}>
            <Pressable onPress={handleAdvanceToCategory} style={styles.primaryCta}>
              <Text style={styles.primaryCtaText}>Next →</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 3: CATEGORY SELECTION (SIMPLE WITH BIG SIZED WORDS)           */}
      {/* ==================================================================== */}
      {currentStep === 3 && (
        <View style={styles.stepContainer}>
          <View style={styles.selectCategoryHeader}>
            <Text style={styles.selectCategoryTitle}>Select Category</Text>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => handleSelectCategory(cat.id)}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    isSelected && styles.categoryCardActive,
                    pressed && styles.categoryCardPressed,
                  ]}
                >
                  <View style={styles.catIconCircle}>
                    <CategoryIcon category={cat.id} size={38} />
                  </View>
                  <Text style={styles.categoryTitle}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 4: 3-QUESTION SOLO PLACEMENT ARENA                           */}
      {/* ==================================================================== */}
      {currentStep === 4 && currentQ && (
        <ScrollView style={styles.arenaContainer} contentContainerStyle={styles.arenaContent}>
          {/* Top Progress Segment Bar: [ 1 ] [ 2 ] [ 3 ] */}
          <View style={styles.progressBarRow}>
            {[0, 1, 2].map((idx) => {
              const isPast = idx < questionIndex;
              const isCurrent = idx === questionIndex;
              return (
                <View
                  key={`segment-${idx}`}
                  style={[
                    styles.progressSegment,
                    isPast && styles.progressSegmentPast,
                    isCurrent && styles.progressSegmentCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.progressSegmentText,
                      isCurrent && styles.progressSegmentTextCurrent,
                    ]}
                  >
                    Q{idx + 1}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Mascot reaction box */}
          <View style={styles.arenaMascotRow}>
            <MascotCompanion
              companion={selectedCompanion}
              size={64}
              expression={mascotReaction}
            />
            <View style={styles.arenaSpeechBubble}>
              <Text style={styles.arenaSpeechText}>
                {selectedAnswer
                  ? selectedAnswer.toUpperCase() === currentQ.answer.toUpperCase()
                    ? 'Excellent speed! Buzzing early boosts bonus Elo.'
                    : 'Good attempt! Let’s adjust calibration on the next.'
                  : isBuzzed
                  ? 'Locked in! Select your answer below.'
                  : 'Read the sequential clue... tap POCHI to freeze!'}
              </Text>
            </View>
          </View>

          {/* Typewriter Streamer Card with Rhythmic Pulsation */}
          <View style={styles.clueCardWrapper}>
            <Animated.View
              style={[
                styles.clueCardPulsingAura,
                {
                  opacity:
                    isStreaming && !isBuzzed && !selectedAnswer
                      ? questionPulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.15, 0.6],
                        })
                      : 0,
                  transform: [
                    {
                      scale:
                        isStreaming && !isBuzzed && !selectedAnswer
                          ? questionPulseAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1.0, 1.035],
                            })
                          : 1.0,
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.clueCard,
                {
                  transform: [
                    {
                      scale:
                        isStreaming && !isBuzzed && !selectedAnswer
                          ? questionPulseAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1.0, 1.02],
                            })
                          : 1.0,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.clueHeaderRow}>
                <View style={styles.badgeCluster}>
                  <Text style={styles.clueCategoryBadge}>{currentQ.category.toUpperCase()}</Text>
                  <View style={styles.introTierBadge}>
                    <Sparkles size={11} color={Colors.gold} />
                    <Text style={styles.introTierBadgeText}>
                      {currentQ.difficulty_tier === 'extremely_easy'
                        ? 'LEVEL 1: EXTREMELY EASY'
                        : currentQ.difficulty_tier === 'very_easy'
                        ? 'LEVEL 2: VERY EASY'
                        : 'LEVEL 3: MEDIUM'}
                    </Text>
                  </View>
                </View>
                <View style={styles.speedBadge}>
                  <SpeedLightningIcon size={12} color={Colors.gold} />
                  <Text style={styles.speedBadgeText}>{currentSpeedMult}x Speed</Text>
                </View>
              </View>
              <Text style={styles.clueBodyText}>
                {currentQ.clue_text.slice(0, revealedChars)}
                {isStreaming && !isBuzzed && revealedChars < currentQ.clue_text.length && (
                  <Text style={styles.cursorText}> ▌</Text>
                )}
              </Text>
            </Animated.View>
          </View>

          {/* Answer Mask (_ _ _ _ _ _) */}
          <View style={styles.maskContainer}>
            <View style={styles.maskRow}>
              {currentQ.answer
                .toUpperCase()
                .split(' ')
                .map((word, wIdx) => (
                  <View key={`w-${wIdx}`} style={styles.maskWord}>
                    {word.split('').map((char, cIdx) => (
                      <View key={`c-${cIdx}`} style={styles.maskSlot}>
                        <Text style={styles.maskSlotText}>
                          {selectedAnswer ? char : '_'}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
            </View>
            <Text style={styles.maskLengthLabel}>
              {currentQ.answer.replace(/\s+/g, '').length} LETTERS
            </Text>
          </View>

          {/* POCHI Buzzer Button or 4 Options */}
          {!isBuzzed && !selectedAnswer ? (
            <View style={styles.arenaBuzzerWrapper}>
              <Pressable onPress={handleBuzzerFreeze} style={styles.arenaBuzzerBtn}>
                <Text style={styles.arenaBuzzerText}>POCHI</Text>
                <Text style={styles.arenaBuzzerSub}>TAP TO FREEZE & ANSWER</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.optionsContainer}>
              {currentQ.options.map((option, idx) => {
                const isOptionSelected = selectedAnswer === option;
                const isTargetAnswer = option.toUpperCase() === currentQ.answer.toUpperCase();
                return (
                  <Pressable
                    key={`opt-${idx}`}
                    onPress={() => handleSelectAnswerOption(option)}
                    disabled={!!selectedAnswer}
                    style={[
                      styles.optionCard,
                      selectedAnswer && isTargetAnswer && styles.optionCardCorrect,
                      selectedAnswer && isOptionSelected && !isTargetAnswer && styles.optionCardIncorrect,
                    ]}
                  >
                    <View style={styles.optionIndexBadge}>
                      <Text style={styles.optionIndexText}>{['A', 'B', 'C', 'D'][idx]}</Text>
                    </View>
                    <Text
                      style={[
                        styles.optionCardText,
                        selectedAnswer && isTargetAnswer && styles.optionCardTextCorrect,
                        selectedAnswer && isOptionSelected && !isTargetAnswer && styles.optionCardTextIncorrect,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 5: THE DIAGNOSTIC ELO & STREAK REVEAL                        */}
      {/* ==================================================================== */}
      {currentStep === 5 && (
        <ScrollView style={styles.stepContainer} contentContainerStyle={styles.stepScrollContent}>
          {/* Trophy Mascot */}
          <View style={styles.revealMascotBox}>
            <MascotCompanion
              companion={selectedCompanion}
              size={110}
              expression="excited"
              withTrophy
            />
          </View>

          <Text style={styles.revealHeader}>Diagnostic Calibration Complete</Text>
          <Text style={styles.revealSub}>Your initial competitive standing:</Text>

          {/* Animated Elo Roll-up Card */}
          <View style={styles.eloRevealCard}>
            <Text style={styles.eloRevealScore}>{displayElo}</Text>
            <Text style={styles.eloRevealLabel}>STARTING ELO</Text>

            {/* Streak Indicator */}
            <Animated.View
              style={[
                styles.streakFlameBadge,
                {
                  opacity: flameAnim,
                  transform: [
                    {
                      scale: flameAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <StreakFlameIcon size={16} color={Colors.gold} />
              <Text style={styles.streakFlameText}>Day 1 Streak Activated!</Text>
            </Animated.View>
          </View>

          {/* Summary Accordion: 3 Placement Questions */}
          <View style={styles.accordionSection}>
            <Text style={styles.accordionHeader}>Review Placement Questions</Text>
            {completedResults.map((item, idx) => {
              const isExpanded = expandedAccordionIndex === idx;
              return (
                <View key={`acc-${idx}`} style={styles.accordionItem}>
                  <Pressable
                    onPress={() =>
                      setExpandedAccordionIndex(isExpanded ? null : idx)
                    }
                    style={styles.accordionBar}
                  >
                    <View style={styles.accordionStatusIcon}>
                      {item.wasCorrect ? (
                        <CheckCircle2 size={18} color={Colors.correct} />
                      ) : (
                        <XCircle size={18} color={Colors.incorrect} />
                      )}
                    </View>
                    <Text style={styles.accordionQuestionTitle} numberOfLines={1}>
                      {item.answer}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={16} color={Colors.inkSecondary} />
                    ) : (
                      <ChevronDown size={16} color={Colors.inkSecondary} />
                    )}
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.accordionDetails}>
                      {item.difficultyTier && (
                        <View style={styles.accordionTierBadge}>
                          <Text style={styles.accordionTierBadgeText}>
                            {item.difficultyTier === 'extremely_easy'
                              ? 'LEVEL 1 • EXTREMELY EASY'
                              : item.difficultyTier === 'very_easy'
                              ? 'LEVEL 2 • VERY EASY'
                              : 'LEVEL 3 • MEDIUM'}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.accordionClueText}>{item.questionText}</Text>
                      <Text style={styles.accordionSummaryText}>{item.contextSummary}</Text>
                      <Pressable
                        onPress={() => handleOpenWikipedia(item.wikiUrl)}
                        style={styles.accordionWikiBtn}
                      >
                        <Text style={styles.accordionWikiBtnText}>Learn more on Wikipedia</Text>
                        <ExternalLink size={13} color={Colors.primaryDark} />
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Advance to Screen 6 */}
          <View style={styles.revealCtaBox}>
            <Pressable onPress={() => setCurrentStep(6)} style={styles.primaryCta}>
              <Text style={styles.primaryCtaText}>Claim My Rank →</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* ==================================================================== */}
      {/* SCREEN 6: THE FRICTIONLESS VALUE-LOCK GATE                           */}
      {/* ==================================================================== */}
      {currentStep === 6 && (
        <View style={styles.stepContainer}>
          <View style={styles.valueLockHeader}>
            <View style={styles.valueLockBadge}>
              <Trophy size={18} color={Colors.gold} />
              <Text style={styles.valueLockBadgeText}>
                {calibratedFinalElo.current} ELO READY
              </Text>
            </View>
            <Text style={styles.valueLockTitle}>Lock in your rating.</Text>
            <Text style={styles.valueLockBody}>
              Save your {calibratedFinalElo.current} Elo, secure your Day 1 streak, and challenge friends to live buzzer duels.
            </Text>
          </View>

          <View style={styles.valueLockButtonsGroup}>
            {/* Google OAuth (Real Sign-In) */}
            <Pressable
              onPress={() => handleCompleteFTUE('google')}
              disabled={isAuthLoading}
              style={({ pressed }) => [
                styles.googleAuthBtn,
                pressed && { transform: [{ translateY: 2 }] },
                isAuthLoading && { opacity: 0.6 },
              ]}
            >
              <GoogleVectorIcon size={20} />
              <Text style={styles.googleAuthBtnText}>
                {isAuthLoading ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </Pressable>

            {/* Guest Option */}
            <Pressable
              onPress={() => handleCompleteFTUE('guest')}
              disabled={isAuthLoading}
              style={styles.guestAuthBtn}
            >
              <Text style={styles.guestAuthBtnText}>Play as Guest for now</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Screen 1 Styles
  screen1Wrapper: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  screen1HeaderBlock: {
    alignItems: 'center',
    marginTop: 16,
  },
  screen1Brand: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.primaryDark,
    letterSpacing: 2,
    marginBottom: 6,
  },
  screen1Title: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.ink,
    textAlign: 'center',
  },
  screen1Body: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.inkSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  screen1MascotBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  screen1BuzzerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  screen1BuzzerHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.cardElevated,
  },
  screen1BuzzerHaloLit: {
    backgroundColor: Colors.primaryDark,
  },
  screen1BuzzerButton: {
    width: 132,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen1BuzzerButtonLit: {
    backgroundColor: Colors.primary,
  },
  screen1BuzzerInner: {
    width: 112,
    height: 108,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  screen1BuzzerText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  screen1HintText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.inkSecondary,
    letterSpacing: 1.2,
    marginTop: 14,
  },

  // Generic Step Container
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stepScrollContent: {
    paddingBottom: 40,
  },
  stepHeader: {
    marginBottom: 16,
  },
  stepPillLabel: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: Colors.primaryDark,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  stepTitle: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.ink,
  },
  stepSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: Colors.inkSecondary,
    marginTop: 4,
  },

  // Screen 2: Companion Grid
  companionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 10,
  },
  companionCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    alignItems: 'center',
    ...Shadows.card,
  },
  companionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  companionName: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.ink,
    marginTop: 6,
  },
  companionRole: {
    fontFamily: Fonts.body,
    fontSize: 11,
    color: Colors.inkSecondary,
    marginTop: 2,
  },

  // Screen 3: Category Grid (Simple with Big Sized Words)
  selectCategoryHeader: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  selectCategoryTitle: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: Colors.ink,
    textAlign: 'center',
  },
  categoryGrid: {
    gap: 16,
    marginVertical: 8,
  },
  categoryCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    ...Shadows.card,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  categoryCardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  catIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.cardSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.ink,
    flex: 1,
  },

  // Bottom CTA
  bottomCtaBox: {
    marginTop: 'auto',
    paddingVertical: 12,
  },
  primaryCta: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  primaryCtaText: {
    fontFamily: Fonts.heading,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // Screen 4: Placement Arena
  arenaContainer: {
    flex: 1,
  },
  arenaContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  progressSegment: {
    flex: 1,
    height: 28,
    backgroundColor: Colors.cardSubtle,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSegmentPast: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  progressSegmentCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressSegmentText: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    color: Colors.inkSecondary,
  },
  progressSegmentTextCurrent: {
    color: '#FFFFFF',
  },
  arenaMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  arenaSpeechBubble: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    ...Shadows.card,
  },
  arenaSpeechText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.ink,
  },
  clueCardWrapper: {
    position: 'relative',
    width: '100%',
    marginVertical: 8,
  },
  clueCardPulsingAura: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    backgroundColor: 'rgba(224, 135, 34, 0.12)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(224, 135, 34, 0.45)',
  },
  clueCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    minHeight: 110,
    ...Shadows.card,
  },
  clueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  introTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  introTierBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.goldDark,
    letterSpacing: 0.5,
  },
  clueCategoryBadge: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  speedBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.goldDark,
  },
  clueBodyText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: Colors.ink,
  },
  cursorText: {
    fontFamily: Fonts.heading,
    color: Colors.primary,
  },
  maskContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  maskRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  maskWord: {
    flexDirection: 'row',
    gap: 4,
  },
  maskSlot: {
    minWidth: 22,
    height: 30,
    backgroundColor: Colors.cardSubtle,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  maskSlotText: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    color: Colors.ink,
  },
  maskLengthLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10,
    color: Colors.inkSecondary,
    letterSpacing: 1,
    marginTop: 6,
  },
  arenaBuzzerWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  arenaBuzzerBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cardElevated,
  },
  arenaBuzzerText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  arenaBuzzerSub: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: Colors.primaryLight,
    letterSpacing: 1,
    marginTop: 2,
  },
  optionsContainer: {
    gap: 8,
    marginTop: 6,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Shadows.card,
  },
  optionCardCorrect: {
    backgroundColor: Colors.correctLight,
    borderColor: Colors.correct,
  },
  optionCardIncorrect: {
    backgroundColor: Colors.incorrectLight,
    borderColor: Colors.incorrect,
  },
  optionIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.cardSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionIndexText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.primaryDark,
  },
  optionCardText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.ink,
  },
  optionCardTextCorrect: {
    color: Colors.correct,
    fontFamily: Fonts.bodyBold,
  },
  optionCardTextIncorrect: {
    color: Colors.incorrect,
  },

  // Screen 5: Reveal
  revealMascotBox: {
    alignItems: 'center',
    marginVertical: 10,
  },
  revealHeader: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.ink,
    textAlign: 'center',
  },
  revealSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  eloRevealCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
    ...Shadows.cardElevated,
  },
  eloRevealScore: {
    fontFamily: Fonts.mono,
    fontSize: 48,
    color: Colors.primaryDark,
  },
  eloRevealLabel: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.inkSecondary,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  streakFlameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: '#F5C189',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  streakFlameText: {
    fontFamily: Fonts.heading,
    fontSize: 12,
    color: Colors.goldDark,
  },
  accordionSection: {
    marginBottom: 16,
  },
  accordionHeader: {
    fontFamily: Fonts.heading,
    fontSize: 14,
    color: Colors.ink,
    marginBottom: 8,
  },
  accordionItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
  accordionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  accordionStatusIcon: {
    marginRight: 8,
  },
  accordionQuestionTitle: {
    flex: 1,
    fontFamily: Fonts.bodyBold,
    fontSize: 13,
    color: Colors.ink,
  },
  accordionDetails: {
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  accordionTierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.goldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  accordionTierBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 9,
    color: Colors.goldDark,
    letterSpacing: 0.5,
  },
  accordionClueText: {
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.ink,
    marginBottom: 6,
  },
  accordionSummaryText: {
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.inkSecondary,
    marginBottom: 8,
  },
  accordionWikiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accordionWikiBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 11,
    color: Colors.primaryDark,
  },
  revealCtaBox: {
    marginVertical: 10,
  },

  // Screen 6: Value-Lock Gate
  valueLockHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 28,
  },
  valueLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.goldLight,
    borderWidth: 1,
    borderColor: Colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  valueLockBadgeText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    color: Colors.goldDark,
  },
  valueLockTitle: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.ink,
    textAlign: 'center',
  },
  valueLockBody: {
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.inkSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
  },
  valueLockButtonsGroup: {
    gap: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  appleAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 14,
    ...Shadows.card,
  },
  appleAuthBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: '#FFFFFF',
  },
  googleAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  googleAuthBtnText: {
    fontFamily: Fonts.heading,
    fontSize: 15,
    color: Colors.ink,
  },
  guestAuthBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestAuthBtnText: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.inkSecondary,
    textDecorationLine: 'underline',
  },
});
