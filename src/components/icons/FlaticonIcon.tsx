/**
 * FlaticonIcon.tsx
 * 
 * Flaticon UIcons Component supporting Flaticon's most-downloaded icon fonts
 * (Regular Rounded, Solid Rounded, Bold Rounded) with high-fidelity SVG fallbacks.
 * 
 * Sources: https://www.flaticon.com/uicons, https://www.flaticon.com/icon-fonts-most-downloaded
 */

import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type FlaticonVariant = 'regular' | 'solid' | 'bold';

export interface FlaticonIconProps {
  name:
    | 'sparkles'
    | 'bolt'
    | 'star'
    | 'flame'
    | 'trophy'
    | 'cross'
    | 'check'
    | 'play'
    | 'refresh'
    | 'clock'
    | 'settings'
    | 'users'
    | 'book'
    | 'heart'
    | 'search'
    | 'arrow-left'
    | string;
  size?: number;
  color?: string;
  variant?: FlaticonVariant;
  style?: any;
}

// SVG Fallback paths matching Flaticon's iconic designs
const FALLBACK_PATHS: Record<string, string> = {
  sparkles:
    'M12 2L14.2 8.3L20.5 10.5L14.2 12.7L12 19L9.8 12.7L3.5 10.5L9.8 8.3L12 2ZM19 18L17.9 14.9L14.8 13.8L17.9 12.7L19 9.6L20.1 12.7L23.2 13.8L20.1 14.9L19 18ZM6 8L5.1 5.6L2.7 4.7L5.1 3.8L6 1.4L6.9 3.8L9.3 4.7L6.9 5.6L6 8Z',
  bolt:
    'M13 2L3 14H12L11 22L21 10H12L13 2Z',
  star:
    'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z',
  flame:
    'M12 2C10 5 7 7.5 7 11.5C7 15.64 10.36 19 14.5 19C15.7 19 16.8 18.7 17.8 18.2C17.1 16.5 16 15 14.5 14C13.5 13.3 12.5 12 12.5 10.5C12.5 9 13.5 7.8 14.2 6.5C15.3 4.5 14.8 2.8 12 2Z',
  trophy:
    'M6 2H18V5C18 8.31 15.31 11 12 11C8.69 11 6 8.31 6 5V2ZM4 4H2V6C2 8.21 3.79 10 6 10V8C4.9 8 4 7.1 4 6V4ZM20 4V6C20 7.1 19.1 8 18 8V10C20.21 10 22 8.21 22 6V4H20ZM10 13H14V17H10V13ZM7 19H17V21H7V19Z',
  users:
    'M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z',
  play:
    'M8 5V19L19 12L8 5Z',
};

// Auto-inject Flaticon UIcons stylesheet into <head> on Web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const cdnIds = ['flaticon-uicons-sr', 'flaticon-uicons-rr'];
  if (!document.getElementById('flaticon-uicons-sr')) {
    const linkSr = document.createElement('link');
    linkSr.id = 'flaticon-uicons-sr';
    linkSr.rel = 'stylesheet';
    linkSr.href = 'https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css';
    document.head.appendChild(linkSr);

    const linkRr = document.createElement('link');
    linkRr.id = 'flaticon-uicons-rr';
    linkRr.rel = 'stylesheet';
    linkRr.href = 'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css';
    document.head.appendChild(linkRr);
  }
}

export const FlaticonIcon: React.FC<FlaticonIconProps> = ({
  name,
  size = 16,
  color = '#0F172A',
  variant = 'regular',
  style,
}) => {
  const prefix = variant === 'solid' ? 'fi-sr' : variant === 'bold' ? 'fi-br' : 'fi-rr';

  // In Web environment with Flaticon UIcons font loaded
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          lineHeight: 1,
          verticalAlign: 'middle',
          ...style,
        }}
      >
        <i
          className={`fi ${prefix}-${name}`}
          style={{
            fontSize: size,
            color,
            display: 'inline-block',
            lineHeight: 1,
          }}
        />
      </span>
    );
  }

  // React Native / Native SVG Fallback
  const pathData = FALLBACK_PATHS[name] || FALLBACK_PATHS.sparkles;

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d={pathData} />
      </Svg>
    </View>
  );
};
