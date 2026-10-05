/**
 * serverUrl.ts
 *
 * Resolves which battle server the app talks to:
 * 1. EXPO_PUBLIC_BATTLE_WS_URL when set (per-build override)
 * 2. Release builds (App Store / Play Store / hosted web) -> the deployed Fly.io server
 * 3. Development -> the dev machine running `npm run battle:server`, reached over the LAN
 *    so physical iPhones/Android phones in Expo Go can connect too
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Matches `app = "pochipochi-battle"` in fly.toml
const PRODUCTION_BATTLE_WS_URL = 'wss://pochipochi-battle.fly.dev';
const DEV_PORT = 4001;

export function resolveBattleServerUrl(): string {
  if (process.env.EXPO_PUBLIC_BATTLE_WS_URL) {
    return process.env.EXPO_PUBLIC_BATTLE_WS_URL;
  }
  if (!__DEV__) {
    return PRODUCTION_BATTLE_WS_URL;
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `ws://${host}:${DEV_PORT}`;
  }
  // e.g. "192.168.1.20:8081" -> the Metro host is the dev machine
  const hostUri = Constants.expoConfig?.hostUri;
  const devHost = hostUri ? hostUri.split(':')[0] : 'localhost';
  return `ws://${devHost}:${DEV_PORT}`;
}
