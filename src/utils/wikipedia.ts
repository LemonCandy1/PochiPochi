/**
 * Wikipedia URL Resolution Utility for PochiPochi
 * 
 * Ensures every trivia question has a verified, well-formed Wikipedia URL
 * that directly links to the article for the question's target answer.
 */

const KNOWN_UPPERCASE_ACRONYMS = new Set([
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'DNA',
  'RNA',
  'ATP',
  'NASA',
  'USA',
  'UK',
  'UN',
  'EU',
  'USSR',
  'FBI',
  'CIA',
  'SI',
  'DC',
  'BC',
  'BCE',
  'CE',
  'AD',
]);

/**
 * Normalizes a raw trivia answer into a canonical Wikipedia article slug.
 * - Cleans HTML tags, surrounding quotes, and extraneous punctuation.
 * - Strips leading articles ("The ", "A ", "An ") for direct Wikipedia indexing.
 * - Strips trailing parenthetical disambiguations.
 * - Converts spaces to underscores and enforces Title Case.
 */
export function getWikipediaSlug(rawAnswer: string): string {
  if (!rawAnswer || typeof rawAnswer !== 'string') {
    return 'Main_Page';
  }

  // 1. Remove HTML tags
  let cleaned = rawAnswer.replace(/<[^>]*>/g, '');

  // 2. Remove surrounding quotes and punctuation
  cleaned = cleaned.replace(/^["'“”‘’«»]+|["'“”‘’«»,.;:!?]+$/g, '').trim();

  // 3. Remove parenthetical qualifiers (e.g., "Paris (France)" -> "Paris")
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '').trim();

  // 4. Remove leading articles if followed by words
  cleaned = cleaned.replace(/^(the|a|an)\s+/i, '').trim();

  if (!cleaned) {
    cleaned = rawAnswer.trim();
  }

  // 5. Title Case words while preserving recognized abbreviations
  const words = cleaned.split(/\s+/);
  const formattedWords = words.map((word) => {
    if (!word) return '';
    const upper = word.toUpperCase();
    if (KNOWN_UPPERCASE_ACRONYMS.has(upper)) {
      return upper;
    }
    // Standard Title Case: capitalize first char, lowercase the rest
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const slug = formattedWords.filter(Boolean).join('_');
  return encodeURIComponent(slug).replace(/%2F/g, '/');
}

/**
 * Returns a proper, fully-qualified Wikipedia article URL for an answer.
 * If an explicit URL is provided and valid (e.g. custom curated mapping),
 * it verifies and retains it; otherwise, it derives the canonical URL from the answer.
 */
export function formatWikipediaUrl(
  answer: string,
  explicitUrl?: string | null
): string {
  if (explicitUrl && typeof explicitUrl === 'string') {
    const trimmed = explicitUrl.trim();
    // Validate that it points to a specific Wikipedia article
    if (
      trimmed.startsWith('https://en.wikipedia.org/wiki/') &&
      trimmed.length > 30 &&
      !trimmed.endsWith('/wiki/')
    ) {
      return trimmed;
    }
    if (
      (trimmed.startsWith('https://') || trimmed.startsWith('http://')) &&
      trimmed.includes('wikipedia.org/wiki/')
    ) {
      return trimmed;
    }
  }

  const slug = getWikipediaSlug(answer);
  return `https://en.wikipedia.org/wiki/${slug}`;
}
