/**
 * invite.ts
 *
 * Builds and shares "come battle me" invites for private rooms.
 * The link opens /battle with the code + password prefilled. When the web build is
 * hosted (EXPO_PUBLIC_WEB_URL), invites use that https link so friends without the
 * app installed can still tap it and play straight from their browser.
 */

import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

export function buildInviteLink(roomCode: string, password: string): string {
  const query = `code=${encodeURIComponent(roomCode)}&pw=${encodeURIComponent(password)}`;
  const webBase =
    process.env.EXPO_PUBLIC_WEB_URL ||
    (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : '');
  if (webBase) {
    return `${webBase.replace(/\/$/, '')}/battle?${query}`;
  }
  return Linking.createURL('/battle', { queryParams: { code: roomCode, pw: password } });
}

export function buildInviteMessage(roomCode: string, password: string): string {
  return (
    `Think you can out-buzz me? Join my PochiPochi battle!\n` +
    `Room: ${roomCode}\nPassword: ${password}\n` +
    buildInviteLink(roomCode, password)
  );
}

/**
 * Opens the native share sheet (iMessage, WhatsApp, KakaoTalk, ...).
 * Returns 'copied' when it fell back to the clipboard (desktop browsers without Web Share).
 */
export async function shareInvite(
  roomCode: string,
  password: string
): Promise<'shared' | 'copied' | 'failed'> {
  const message = buildInviteMessage(roomCode, password);
  const canWebShare =
    Platform.OS !== 'web' || (typeof navigator !== 'undefined' && Boolean(navigator.share));

  if (canWebShare) {
    try {
      await Share.share({ message });
      return 'shared';
    } catch {
      // fall through to clipboard
    }
  }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      return 'copied';
    }
  } catch {}
  return 'failed';
}
