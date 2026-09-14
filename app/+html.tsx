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
        <title>PochiPochi — 1v1 Battle Arena</title>
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
              background-color: #020617;
            }
          `,
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
