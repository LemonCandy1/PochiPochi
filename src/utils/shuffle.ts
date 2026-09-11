/**
 * Unbiased Fisher-Yates (Knuth) Array Shuffler & Question Options Randomizer
 * 
 * Guarantees uniform distribution for multiple-choice trivia options across slots A, B, C, and D.
 */

/**
 * Creates a new array with items shuffled using the Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: readonly T[] | T[]): T[] {
  if (!array || array.length <= 1) {
    return array ? [...array] : [];
  }

  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Randomizes multiple-choice trivia options, guaranteeing that the target correct answer
 * is included in the options set and placed in a randomized position.
 * 
 * @param options - Array of answer choices (typically 4 choices)
 * @param correctAnswer - The target correct answer string
 * @returns A new shuffled array with the answer choices in randomized order
 */
export function randomizeQuestionOptions(
  options: readonly string[] | string[] | undefined,
  correctAnswer: string
): string[] {
  if (!options || options.length === 0) {
    return [correctAnswer];
  }

  const trimmedTarget = correctAnswer.trim().toUpperCase();

  // Verify the target answer is present in the options list
  const hasTarget = options.some(
    (opt) => opt.trim().toUpperCase() === trimmedTarget
  );

  let pool: string[];
  if (hasTarget) {
    pool = [...options];
  } else {
    // If target answer was missing from distractors, prepend it and take up to 4
    pool = [correctAnswer, ...options.filter((o) => o.trim().toUpperCase() !== trimmedTarget).slice(0, 3)];
  }

  // Perform Fisher-Yates shuffle
  return shuffleArray(pool);
}
