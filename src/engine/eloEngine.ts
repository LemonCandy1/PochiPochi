import { EloChangeResult } from '../types';

export interface CalculateEloParams {
  playerElo: number;
  questionElo: number;
  isCorrect: boolean;
  /** Fraction of clue revealed when buzzed (0.0 = immediate start, 1.0 = full clue revealed) */
  buzzProgressRatio: number;
  baseK?: number;
}

/**
 * Calculates dual-sided Elo adjustment for player and question.
 * Treats the question as an opponent:
 * - When player wins (S=1), question Elo drops and player Elo rises.
 * - When player loses (S=0), question Elo rises and player Elo drops.
 * Earlier interrupts yield higher speed multipliers on K-factor.
 */
/**
 * Calculates speed multiplier from the fraction of clue words revealed when answered.
 * Answering on the first words yields up to a 2.0x bonus score & Elo gain.
 */
export function getSpeedMultiplier(progressRatio: number): number {
  const clamped = Math.max(0, Math.min(1, progressRatio));
  return Number((2.0 - clamped * 1.0).toFixed(2));
}

export function calculateDualElo({
  playerElo,
  questionElo,
  isCorrect,
  buzzProgressRatio,
  baseK = 32,
}: CalculateEloParams): EloChangeResult {
  // Expected score for player
  const expectedPlayer = 1 / (1 + Math.pow(10, (questionElo - playerElo) / 400));
  const expectedQuestion = 1 - expectedPlayer;

  // Speed-based dynamic K-multiplier (2.0x down to 1.0x)
  const speedMultiplier = getSpeedMultiplier(buzzProgressRatio);

  const kPlayer = baseK * speedMultiplier;
  const kQuestion = baseK * speedMultiplier;

  const playerActual = isCorrect ? 1 : 0;
  const questionActual = isCorrect ? 0 : 1;

  // Score adjustments
  const rawDeltaPlayer = kPlayer * (playerActual - expectedPlayer);
  const rawDeltaQuestion = kQuestion * (questionActual - expectedQuestion);

  // Rounding: guarantee at least +/- 1 if difference exists
  const deltaPlayer = Math.round(rawDeltaPlayer) || (isCorrect ? 1 : -1);
  const deltaQuestion = Math.round(rawDeltaQuestion) || (isCorrect ? -1 : 1);

  const playerEloAfter = Math.max(100, playerElo + deltaPlayer);
  const questionEloAfter = Math.max(100, questionElo + deltaQuestion);

  return {
    playerEloBefore: playerElo,
    playerEloAfter,
    deltaPlayer,
    questionEloBefore: questionElo,
    questionEloAfter,
    deltaQuestion,
    speedMultiplier,
  };
}

/**
 * Determines a human-readable title for a given Elo rating.
 */
export type RankBadgeId = 'owl' | 'cat' | 'bear' | 'pup' | 'novice';

export function getEloRankTier(elo: number): {
  tier: string;
  badgeId: RankBadgeId;
  color: string;
} {
  if (elo >= 1200) return { tier: 'Grandmaster Owl', badgeId: 'owl', color: '#00009F' };
  if (elo >= 900) return { tier: 'Trivia Master Cat', badgeId: 'cat', color: '#7C3AED' };
  if (elo >= 650) return { tier: 'Scholar Bear', badgeId: 'bear', color: '#059669' };
  if (elo >= 400) return { tier: 'Smart Pup', badgeId: 'pup', color: '#E08722' };
  return { tier: 'Curious Novice', badgeId: 'novice', color: '#64748B' };
}

/**
 * Calculates global expected/actual accuracy percentage for a question.
 * Uses historical times_served/times_correct if >= 5 attempts,
 * otherwise calculates calibrated expected percentage from question Elo (200 - 800).
 */
export function calculateGlobalCorrectPercentage(question: {
  elo_rating?: number;
  times_served?: number;
  times_correct?: number;
}): number {
  if (question.times_served && question.times_served >= 5) {
    const raw = Math.round((question.times_correct! / question.times_served) * 100);
    return Math.max(10, Math.min(96, raw));
  }
  // Standard logistical probability curve based on calibrated question Elo:
  // Elo 200 -> ~85%
  // Elo 350 -> ~70%
  // Elo 500 -> ~52%
  // Elo 650 -> ~36%
  const elo = question.elo_rating ?? 350;
  const prob = 1 / (1 + Math.pow(10, (elo - 380) / 450));
  const calculated = Math.round(prob * 100);
  return Math.max(12, Math.min(94, calculated));
}

