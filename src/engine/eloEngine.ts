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
  if (elo >= 2000) return { tier: 'Grandmaster Owl', badgeId: 'owl', color: '#1D4ED8' };
  if (elo >= 1700) return { tier: 'Trivia Master Cat', badgeId: 'cat', color: '#7C3AED' };
  if (elo >= 1500) return { tier: 'Scholar Bear', badgeId: 'bear', color: '#059669' };
  if (elo >= 1300) return { tier: 'Smart Pup', badgeId: 'pup', color: '#D97706' };
  return { tier: 'Curious Novice', badgeId: 'novice', color: '#64748B' };
}
