import React from 'react';
import { COLORS } from '../content';

export const SCREEN_W = 432;
export const SCREEN_H = 960;
export const BEZEL = 14;
export const PHONE_W = SCREEN_W + BEZEL * 2;
export const PHONE_H = SCREEN_H + BEZEL * 2;

/** Minimal modern phone frame. Children render in a 432×960 screen coordinate space. */
export const Phone: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'relative',
      width: PHONE_W,
      height: PHONE_H,
      borderRadius: 70,
      background: '#151C2E',
      padding: BEZEL,
      boxSizing: 'border-box',
      boxShadow:
        '0 50px 90px -30px rgba(15,23,42,0.38), 0 18px 36px -12px rgba(15,23,42,0.22), inset 0 0 0 2px #2A3350',
    }}
  >
    <div
      style={{
        position: 'relative',
        width: SCREEN_W,
        height: SCREEN_H,
        borderRadius: 57,
        overflow: 'hidden',
        background: COLORS.background,
      }}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: SCREEN_W / 2 - 54,
          width: 108,
          height: 30,
          borderRadius: 16,
          background: '#0B0F1A',
        }}
      />
    </div>
  </div>
);
