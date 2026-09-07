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
    const redirectUri =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081';

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
    if (result.type === 'success') {
      return GoogleAuthService._resolveFromUrl(supabase, result.url);
    }
    // On web cancelled / dismissed fallback to session check
    return GoogleAuthService._sessionFallback(supabase);
  }

  // ─── NATIVE (Expo Go / dev build) ───────────────────────────────────────────

  private static async _signInNative(supabase: any): Promise<GoogleAuthResponse> {
    // Build the redirect URI Expo Go / the native build will respond to
    let redirectUri = Linking.createURL('auth/callback');
    if (!redirectUri || redirectUri.startsWith('null://') || redirectUri === 'null') {
      redirectUri = 'pochipochi://auth/callback';
    }

    console.log('[GoogleAuth] Native redirectUri:', redirectUri);

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

    console.log('[GoogleAuth] Opening browser for:', data.url);

    // Promise that resolves when Linking fires an incoming deep-link
    const callbackUrlPromise = new Promise<string>((resolve) => {
      const subscription = Linking.addEventListener('url', (event) => {
        const url = event.url;
        if (
          url &&
          (url.includes('auth/callback') ||
            url.includes('code=') ||
            url.includes('access_token='))
        ) {
          subscription.remove();
          resolve(url);
        }
      });
    });

    // Open the full system browser (NOT chrome custom tab / openAuthSessionAsync).
    // On Android Expo Go, openBrowserAsync opens a separate browser window.
    // When the deep link fires (exp://...), the OS kills the browser and switches
    // back to Expo Go, triggering the Linking 'url' event above.
    WebBrowser.openBrowserAsync(data.url, {
      toolbarColor: '#F8F5EE',
      controlsColor: '#00009F',
      secondaryToolbarColor: '#F8F5EE',
      showTitle: true,
      enableDefaultShareMenuItem: false,
    }).catch(() => {
      // If the browser promise rejects (e.g. user closed it), we'll handle
      // via the timeout below.
    });

    // Race between Linking event and a generous timeout
    const callbackUrl = await Promise.race<string | null>([
      callbackUrlPromise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 120_000)), // 2 min
    ]);

    // Dismiss the browser once we have the deep link
    WebBrowser.dismissBrowser();

    if (!callbackUrl) {
      // Timed out or user closed browser — check if session landed anyway
      return GoogleAuthService._sessionFallback(supabase);
    }

    return GoogleAuthService._resolveFromUrl(supabase, callbackUrl);
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
      if (error || !data.user) {
        return {
          type: 'error',
          message: error?.message || 'Failed to exchange authorization code',
        };
      }
      authUser = data.user;
    } else if (accessToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });
      if (error || !data.user) {
        return {
          type: 'error',
          message: error?.message || 'Failed to establish session',
        };
      }
      authUser = data.user;
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
