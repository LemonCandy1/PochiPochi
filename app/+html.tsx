import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML layout for Expo Router web rendering.
 * Injects Tailwind CSS for modern responsive styling.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <title>PochiPochi</title>
        <meta
          name="description"
          content="Buzzer-speed trivia for people who know weirdly specific things. Battle friends 1v1 with a room code."
        />
        {/* Installable from the browser ("Add to Home Screen") on iPhone and Android */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F8F5EE" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="PochiPochi" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-1024.png" />
        <ScrollViewStyleReset />
        <script src="https://cdn.tailwindcss.com"></script>
        {/* Flaticon UIcons - Most Downloaded Icon Fonts */}
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-rounded/css/uicons-bold-rounded.css"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body, #root {
              height: 100%;
              margin: 0;
              padding: 0;
              background-color: #F8F5EE;
            }
          `,
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
