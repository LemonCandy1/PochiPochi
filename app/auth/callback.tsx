import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { SupabaseService } from '../../src/services/supabase/supabaseClient';
import { PochiRepository } from '../../src/data/repository';
import { AudioHaptics } from '../../src/utils/audioHaptics';
import { Colors } from '../../src/theme/colors';

// Ensure any active browser session closes
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
    access_token?: string;
    refresh_token?: string;
  }>();

  const [statusMessage, setStatusMessage] = useState('Completing sign-in...');

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      try {
        // Dismiss any lingering browser custom tabs
        WebBrowser.dismissAuthSession();

        const supabase = SupabaseService.getClient();

        // 1. Check for error returned by provider
        if (params.error || params.error_description) {
          console.error('[AuthCallback] OAuth Error:', params.error_description || params.error);
          setStatusMessage('Sign-in could not be completed.');
          setTimeout(() => {
            if (isMounted) router.replace('/ftue');
          }, 1500);
          return;
        }

        // 2. Extract code from search params or full initial URL
        let authCode = params.code;
        if (!authCode) {
          const initialUrl = await Linking.getInitialURL();
          if (initialUrl) {
            const parsed = Linking.parse(initialUrl);
            authCode = parsed.queryParams?.code as string | undefined;
          }
        }

        // 3. If code exists, exchange it for a session (PKCE Flow)
        if (authCode) {
          setStatusMessage('Verifying credentials...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);

          if (error) {
            console.error('[AuthCallback] exchangeCodeForSession error:', error.message);
            setStatusMessage('Session exchange failed. Returning to welcome...');
            setTimeout(() => {
              if (isMounted) router.replace('/ftue');
            }, 1500);
            return;
          }

          const user = data.session?.user;
          if (user && isMounted) {
            await finalizeUserLogin(user);
            return;
          }
        }

        // 4. Fallback: check if session is already established
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user && isMounted) {
          await finalizeUserLogin(sessionData.session.user);
          return;
        }

        // 5. If no credentials found after a brief moment, return to FTUE
        setStatusMessage('No active session found. Redirecting...');
        setTimeout(() => {
          if (isMounted) router.replace('/ftue');
        }, 1500);
      } catch (err: any) {
        console.error('[AuthCallback] Exception:', err);
        if (isMounted) {
          setStatusMessage('An unexpected error occurred.');
          setTimeout(() => router.replace('/ftue'), 1500);
        }
      }
    }

    async function finalizeUserLogin(user: any) {
      try {
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          (user.email ? user.email.split('@')[0] : 'PochiScholar');

        // Complete FTUE if pending
        const session = {
          guestId: user.id,
          selectedCompanion: 'dog' as const,
          selectedCategory: 'science' as const,
          calibratedElo: 1200,
          sessionStreak: 1,
          completedQuestions: [],
        };
        const profile = await PochiRepository.completeFTUE(session, 'google');
        await PochiRepository.saveProfile({
          ...profile,
          username: name,
          id: user.id,
        });

        AudioHaptics.playCorrect();
        router.replace('/(tabs)');
      } catch (e) {
        console.error('[AuthCallback] Failed to finalize user login:', e);
        router.replace('/(tabs)');
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [params.code, params.error]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
        <Text style={styles.title}>Connecting Account</Text>
        <Text style={styles.status}>{statusMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  spinner: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Fredoka_700Bold',
    color: Colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.inkMuted,
    textAlign: 'center',
  },
});
