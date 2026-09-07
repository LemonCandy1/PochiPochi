import '../src/utils/cryptoPolyfill';
import {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from '@expo-google-fonts/fredoka';
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import { SplashScreen, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PochiRepository } from '../src/data/repository';
import { Colors } from '../src/theme/colors';

// Complete any pending browser auth sessions on app launch
WebBrowser.maybeCompleteAuthSession();

// Prevent auto-hiding the splash screen until fonts are loaded
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_700Bold,
    Fredoka_600SemiBold,
    Nunito_600SemiBold,
    Nunito_700Bold,
    SpaceMono_700Bold,
    SpaceMono_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
      PochiRepository.hasCompletedFTUE().then((completed) => {
        if (!completed) {
          router.replace('/ftue');
        }
      });
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ftue" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="auth/callback" options={{ headerShown: false, animation: 'none' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
