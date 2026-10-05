/**
 * Editable content for the PochiPochi promo.
 * Copy, colors, timing and sample UI data live here so the scenes stay presentation-only.
 */

// Brand palette — mirrors src/theme/colors.ts in the app
export const COLORS = {
  background: '#F8F5EE',
  backgroundSecondary: '#F5F0E6',
  card: '#FFFFFF',
  ink: '#0F172A',
  inkSecondary: '#334155',
  inkMuted: '#64748B',
  border: '#E2DDD2',
  primary: '#00009F',
  primaryDark: '#000075',
  primaryLight: '#E8E8FC',
  primarySubtle: '#F0F0FF',
  correct: '#2E7D56',
  correctLight: '#E8F4EE',
  incorrect: '#C24134',
  incorrectLight: '#FCEBE9',
  gold: '#E08722',
  goldLight: '#FDF2E4',
  goldDark: '#B86810',
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
};

/** Scene lengths in frames (30fps). Change these to retime the video; total duration follows. */
export const TIMING = {
  hook: 90,
  intro: 120,
  buzz: 135,
  room: 105,
  elo: 135,
  close: 105,
};

export const COPY = {
  hook: {
    clue: 'Stretching over 7,000 km along western South Am',
    line1: 'Know it?',
    line2: 'Buzz first.',
  },
  intro: {
    eyebrow: 'PochiPochi',
    headline: 'Clues reveal\nletter by letter.',
    sub: 'Answer early for up to a 2.0x bonus.',
  },
  buzz: {
    eyebrow: 'LIVE 1v1 BATTLES',
    headline: 'Buzz in first.\nBeat your rival.',
  },
  room: {
    eyebrow: 'PRIVATE ROOMS',
    headline: 'Share a code.\nPlay anywhere.',
  },
  elo: {
    eyebrow: 'YOUR STATS',
    headline: 'Know your strengths.',
    sub: 'Elo for every category.',
  },
  close: {
    name: 'PochiPochi',
    kana: 'ポチポチ',
    tagline: 'Fun, portable, competitive trivia.',
  },
};

/** Sample data shown inside the phone UI (illustrative, mirrors real app screens). */
export const UI = {
  category: 'GEOGRAPHY',
  playerElo: 1221,
  clue:
    'Stretching over 7,000 kilometers along western South America, this is the longest continental mountain range in the world.',
  answer: 'ANDESMOUNTAINS',
  options: ['Rockies', 'Alps', 'Andes Mountains', 'Himalayas'],
  you: 'You',
  rival: 'Kenji',
  roomCode: 'KX4PM',
  roomPassword: '4821',
  categoryElos: [
    { key: 'ANIME', value: 1415, tag: 'STRENGTH' as const },
    { key: 'GEOGRAPHY', value: 1342 },
    { key: 'GENERAL', value: 1260 },
    { key: 'SCIENCE', value: 1188, tag: 'WEAK SPOT' as const },
  ],
};
