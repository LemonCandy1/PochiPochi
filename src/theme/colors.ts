export const Colors = {
  // Canvas Base (Fair Bianca)
  background: '#F8F5EE',
  backgroundSecondary: '#F5F0E6',
  card: '#FFFFFF',
  cardSubtle: '#F5F0E6',

  // Anchor / Text (Deep Navy)
  ink: '#0F172A',
  inkSecondary: '#334155',
  inkMuted: '#64748B',
  border: '#E2DDD2',
  borderDark: '#0F172A',

  // Focus / Selection (Deep Royal / Electric Blue)
  primary: '#00009F',
  primaryDark: '#000075',
  primaryLight: '#E8E8FC',
  primarySubtle: '#F0F0FF',

  // Semantic Feedback - Success State (Muted Emerald)
  correct: '#2E7D56',
  correctLight: '#E8F4EE',
  correctBorder: '#8ED1AF',

  // Semantic Feedback - Error State (Crimson / Brick)
  incorrect: '#C24134',
  incorrectLight: '#FCEBE9',
  incorrectBorder: '#F1A49C',

  // Competitive Accent (Amber / Burnt Ochre)
  gold: '#E08722',
  goldLight: '#FDF2E4',
  goldDark: '#B86810',

  // Supporting Accent
  purple: '#7C3AED',
  purpleLight: '#EDE9FE',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Shadows = {
  hard: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  buzzer: {
    shadowColor: '#000075',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardElevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};
