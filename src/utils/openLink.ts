import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { formatWikipediaUrl } from './wikipedia';

/**
 * Robust Cross-Platform Link Opener for PochiPochi
 * 
 * Guarantees seamless link handling across all environments:
 * 1. Web / HTML: Opens in a new tab via window.open('...', '_blank') with noopener/noreferrer.
 * 2. Expo Go (Android / iOS): Launches the in-app Chrome Custom Tab / Safari View Controller,
 *    falling back to native system Linking.openURL if WebBrowser encounters runtime constraints.
 */
export async function openExternalLink(
  url: string,
  answerFallback?: string
): Promise<boolean> {
  const targetUrl = answerFallback
    ? formatWikipediaUrl(answerFallback, url)
    : url;

  if (!targetUrl || typeof targetUrl !== 'string') {
    return false;
  }

  try {
    // 1. Web / HTML Browser
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && typeof window.open === 'function') {
        const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (win) {
          return true;
        }
      }
      return await Linking.openURL(targetUrl);
    }

    // 2. Native Expo Go / Standalone Device
    try {
      await WebBrowser.openBrowserAsync(targetUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
        toolbarColor: '#000075',
        controlsColor: '#FFFFFF',
        showTitle: true,
      });
      return true;
    } catch (browserErr) {
      // Fallback cleanly to system Linking if in-app browser is not supported
      return await Linking.openURL(targetUrl);
    }
  } catch (err) {
    console.warn('[openExternalLink] Could not open link:', targetUrl, err);
    return false;
  }
}

/**
 * Returns HTML anchor attributes for React Native Web Pressable / Text components.
 * On web, this causes React Native Web to emit a true semantic `<a href="..." target="_blank">`
 * tag in the DOM, enabling right-click "Copy Link Address", middle-click, and SEO indexing.
 */
export function getHtmlLinkProps(url: string, answerFallback?: string) {
  const targetUrl = answerFallback
    ? formatWikipediaUrl(answerFallback, url)
    : url;

  if (Platform.OS === 'web') {
    return {
      accessibilityRole: 'link' as const,
      href: targetUrl,
      hrefAttrs: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    };
  }

  return {
    accessibilityRole: 'link' as const,
  };
}
