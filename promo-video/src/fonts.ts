import { loadFont as loadFredoka } from '@remotion/google-fonts/Fredoka';
import { loadFont as loadNunito } from '@remotion/google-fonts/Nunito';
import { loadFont as loadSpaceMono } from '@remotion/google-fonts/SpaceMono';

// Same type system as the app: Fredoka (display), Nunito (body), Space Mono (data)
export const FONTS = {
  heading: loadFredoka('normal', { weights: ['600', '700'], subsets: ['latin'] }).fontFamily,
  body: loadNunito('normal', { weights: ['600', '700', '800'], subsets: ['latin'] }).fontFamily,
  mono: loadSpaceMono('normal', { weights: ['400', '700'], subsets: ['latin'] }).fontFamily,
  // Kana uses system Japanese fonts — a Google JP font costs ~120 requests per render tab
  jp: '"Yu Gothic UI", "Yu Gothic", "Hiragino Sans", "Noto Sans CJK JP", Meiryo, sans-serif',
};
