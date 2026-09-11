import '../../utils/cryptoPolyfill';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { SupabaseService } from '../supabase/supabaseClient';

export interface GoogleAuthUser {
  email: string;
  displayName: string;
  userId: string;
}

export type GoogleAuthResponse =
  | { type: 'success'; user: GoogleAuthUser }
  | { type: 'provider_not_enabled'; message: string }
  | { type: 'cancelled' }
  | { type: 'error'; message: string };

/**
 * Google Web-Based OAuth Authentication Service via Supabase.
 *
 * Strategy:
 * - WEB: Uses openAuthSessionAsync (popup-like, works natively).
 * - NATIVE (Expo Go / Development Build):
 *   Uses openBrowserAsync + Linking event listener.
 *   The browser opens Google sign-in. When Google redirects back through
 *   Supabase to the deep link (exp://... or pochipochi://...), the OS fires
 *   a Linking 'url' event in the app. We capture the code there, dismiss the
 *   browser, and exchange the code for a Supabase session.
 *   This avoids the white-screen hang caused by Chrome Custom Tab's inability
 *   to handle exp:// redirects in Expo Go.
 */
export class GoogleAuthService {
  /**
   * Initiates Google Sign-In via Supabase Web OAuth.
   */
  static async signInWithGoogle(): Promise<GoogleAuthResponse> {
    try {
      const supabase = SupabaseService.getClient();

      if (Platform.OS === 'web') {
        return GoogleAuthService._signInWeb(supabase);
      } else {
        return GoogleAuthService._signInNative(supabase);
      }
    } catch (err: any) {
      return {
        type: 'error',
        message: err?.message || 'Unexpected error during Google sign-in',
      };
    }
  }

  // ─── WEB ────────────────────────────────────────────────────────────────────

  private static async _signInWeb(supabase: any): Promise<GoogleAuthResponse> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';
    // Use the explicitly whitelisted /auth/callback path
    const redirectUri = `${origin}/auth/callback`;

    console.log('[GoogleAuth] Web redirectUri:', redirectUri);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      return GoogleAuthService._oauthError(error?.message);
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
    if (result.type === 'success' && result.url) {
      return GoogleAuthService._resolveFromUrl(supabase, result.url);
    }
    // On web cancelled / dismissed fallback to session check
    return GoogleAuthService._sessionFallback(supabase);
  }

  // ─── NATIVE (Expo Go / dev build / standalone) ──────────────────────────────

  private static async _signInNative(supabase: any): Promise<GoogleAuthResponse> {
    // Select the optimal redirect URI whitelisted in Supabase:
    // In Expo Go, Android only routes 'exp://' intents (custom schemes like pochipochi://
    // are not registered in the Expo Go APK manifest).
    // 'exp://localhost:8081/--/auth/callback' is explicitly whitelisted in Supabase and
    // handled natively by Expo Go.
    // For standalone builds / dev clients, 'pochipochi://auth/callback' is used.
    let isExpoGo = false;
    try {
      const Constants = require('expo-constants').default;
      isExpoGo =
        Constants?.appOwnership === 'expo' ||
        Constants?.executionEnvironment === 'storeClient';
    } catch {
      // ignore
    }

    const redirectUri = isExpoGo
      ? 'exp://localhost:8081/--/auth/callback'
      : 'pochipochi://auth/callback';

    console.log('[GoogleAuth] Native redirectUri:', redirectUri, '(isExpoGo:', isExpoGo, ')');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data?.url) {
      return GoogleAuthService._oauthError(error?.message);
    }

    console.log('[GoogleAuth] Opening auth session for:', data.url);

    // Clean up any stale sessions before starting
    WebBrowser.maybeCompleteAuthSession();

    let resolved = false;
    let linkingSubscription: any = null;

    // Concurrent listener that captures ANY incoming deep link containing tokens or code,
    // whether starting with exp:// or pochipochi://
    const deepLinkPromise = new Promise<string>((resolve) => {
      linkingSubscription = Linking.addEventListener('url', (event) => {
        const url = event.url;
        if (
          url &&
          (url.includes('access_token=') ||
            url.includes('code=') ||
            url.includes('auth/callback'))
        ) {
          console.log('[GoogleAuth] Captured deep link via Linking listener:', url.split('?')[0]);
          resolved = true;
          resolve(url);
        }
      });
    });

    // Run openAuthSessionAsync in parallel with deep link listener
    const authSessionPromise = WebBrowser.openAuthSessionAsync(data.url, redirectUri).then(
      (res) => {
        if (res.type === 'success' && res.url) {
          console.log('[GoogleAuth] Captured deep link via openAuthSessionAsync:', res.url.split('?')[0]);
          resolved = true;
          return res.url;
        }
        return null;
      }
    );

    // 30s safety timeout to prevent infinite hanging
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 30_000)
    );

    try {
      const callbackUrl = await Promise.race([
        deepLinkPromise,
        authSessionPromise,
        timeoutPromise,
      ]);

      if (linkingSubscription) {
        linkingSubscription.remove();
        linkingSubscription = null;
      }

      // Dismiss any lingering browser tab
      try {
        WebBrowser.dismissAuthSession();
      } catch {}

      if (callbackUrl) {
        return await GoogleAuthService._resolveFromUrl(supabase, callbackUrl);
      }

      // If user closed the window or timeout expired, check if session landed
      return await GoogleAuthService._sessionFallback(supabase);
    } catch (err: any) {
      if (linkingSubscription) {
        linkingSubscription.remove();
      }
      return {
        type: 'error',
        message: err?.message || 'Authentication session interrupted',
      };
    }
  }

  // ─── Shared helpers ──────────────────────────────────────────────────────────

  /**
   * Parses a callback URL and exchanges a code / sets tokens.
   */
  private static async _resolveFromUrl(
    supabase: any,
    url: string
  ): Promise<GoogleAuthResponse> {
    const fragmentStr = url.includes('#') ? url.split('#')[1] : '';
    const queryStr = url.includes('?') ? url.split('?')[1]?.split('#')[0] : '';
    const params = new URLSearchParams(fragmentStr || queryStr);

    const errorParam = params.get('error');
    const errorDesc = params.get('error_description');
    if (errorParam || errorDesc) {
      return {
        type: 'error',
        message: errorDesc || errorParam || 'Authentication failed',
      };
    }

    const code = params.get('code');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    let authUser: any = null;

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data?.user) {
        // Code might have already been exchanged by the callback route handler; check active session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          authUser = sessionData.session.user;
        } else {
          return {
            type: 'error',
            message: error?.message || 'Failed to exchange authorization code',
          };
        }
      } else {
        authUser = data.user;
      }
    } else if (accessToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });
      if (error || !data?.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          authUser = sessionData.session.user;
        } else {
          return {
            type: 'error',
            message: error?.message || 'Failed to establish session',
          };
        }
      } else {
        authUser = data.user;
      }
    } else {
      return GoogleAuthService._sessionFallback(supabase);
    }

    return GoogleAuthService._userFromSupabaseUser(authUser);
  }

  /**
   * Polls for an existing session (fallback for cases where the code was
   * already exchanged by Supabase JS internals or by the callback route).
   */
  private static async _sessionFallback(supabase: any): Promise<GoogleAuthResponse> {
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        return GoogleAuthService._userFromSupabaseUser(data.session.user);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return { type: 'cancelled' };
  }

  private static _userFromSupabaseUser(u: any): GoogleAuthResponse {
    const displayName =
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      u.user_metadata?.preferred_username ||
      (u.email ? u.email.split('@')[0] : 'PochiScholar');
    return {
      type: 'success',
      user: {
        email: u.email || '',
        displayName: displayName || 'PochiScholar',
        userId: u.id,
      },
    };
  }

  private static _oauthError(msg?: string): GoogleAuthResponse {
    if (msg?.includes('not enabled') || msg?.includes('provider')) {
      return {
        type: 'provider_not_enabled',
        message: 'Google sign-in is not enabled in your Supabase dashboard.',
      };
    }
    return {
      type: 'error',
      message: msg || 'Failed to initialize Google OAuth session',
    };
  }

  // ─── Utility ─────────────────────────────────────────────────────────────────

  /**
   * Generates a demo Google user for testing.
   */
  static getDemoUser(): GoogleAuthUser {
    return {
      email: 'pochi.scholar@gmail.com',
      displayName: 'PochiScholar',
      userId: 'google-demo-' + Date.now(),
    };
  }

  /**
   * Signs the user out from Supabase.
   */
  static async signOut(): Promise<void> {
    try {
      const supabase = SupabaseService.getClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[GoogleAuth] Error during sign-out:', err);
    }
  }
}
