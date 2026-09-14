/**
 * matrixGenerator.ts
 * 
 * Dynamic 4x4 (16-tile) character matrix generator for Pochi Battle trivia.
 * - Extracts all letters from the target answer (preserving multiset counts)
 * - Selects distractor letters from an English frequency-weighted distribution
 * - Unbiased Fisher-Yates shuffle
 */

import { MatrixTile } from './types';

// English letter frequency distribution
const ENGLISH_LETTER_FREQUENCIES: Record<string, number> = {
  E: 127,
  T: 91,
  A: 82,
  O: 75,
  I: 70,
  N: 67,
  S: 63,
  H: 61,
  R: 60,
  D: 43,
  L: 40,
  C: 28,
  U: 28,
  M: 24,
  W: 24,
  F: 22,
  G: 20,
  Y: 20,
  P: 19,
  B: 15,
  V: 10,
  K: 8,
  J: 2,
  X: 2,
  Q: 1,
  Z: 1,
};

const WEIGHTED_LETTER_POOL: string[] = (() => {
  const pool: string[] = [];
  for (const [letter, weight] of Object.entries(ENGLISH_LETTER_FREQUENCIES)) {
    for (let i = 0; i < weight; i++) {
      pool.push(letter);
    }
  }
  return pool;
})();

export function cleanAnswerString(answer: string): string {
  return answer.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRandomDistractorLetter(): string {
  const index = Math.floor(Math.random() * WEIGHTED_LETTER_POOL.length);
  return WEIGHTED_LETTER_POOL[index] || 'E';
}

export const MAX_DYNAMIC_LETTERS = 8;

export function generateDynamicLetterChoices(neededLetter: string, totalChoices = 6): string[] {
  const upperNeeded = neededLetter.toUpperCase();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const distractors = alphabet.filter((l) => l !== upperNeeded);
  const shuffledDistractors = shuffleArray(distractors).slice(0, totalChoices - 1);
  return shuffleArray([upperNeeded, ...shuffledDistractors]);
}

export function shouldAutocomplete(currentTypedLength: number, totalAnswerLength: number): boolean {
  return currentTypedLength >= Math.min(totalAnswerLength, MAX_DYNAMIC_LETTERS);
}

export function generateAnswerMatrix(answer: string, gridSize = 16): MatrixTile[] {
  const cleanAnswer = cleanAnswerString(answer);
  const answerLetters = cleanAnswer.split('');

  const tiles: string[] = [...answerLetters];

  const distractorsNeeded = Math.max(0, gridSize - tiles.length);
  for (let i = 0; i < distractorsNeeded; i++) {
    tiles.push(getRandomDistractorLetter());
  }

  const shuffledLetters = shuffleArray(tiles);

  return shuffledLetters.map((letter, idx) => ({
    id: `tile-${idx}-${letter}`,
    letter,
    isUsed: false,
  }));
}

