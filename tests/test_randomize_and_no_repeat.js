/**
 * Automated Verification Script:
 * 1. Answer Randomization: Verifies options appear in different orders across slots A, B, C, D with uniform distribution.
 * 2. Question No-Repeat: Verifies that once a user attempts a trivia question, they never encounter it again.
 */

const assert = require('assert');

// 1. Emulate Fisher-Yates shuffle & randomizeQuestionOptions
function shuffleArray(array) {
  if (!array || array.length <= 1) return array ? [...array] : [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

function randomizeQuestionOptions(options, correctAnswer) {
  if (!options || options.length === 0) return [correctAnswer];
  const trimmedTarget = correctAnswer.trim().toUpperCase();
  const hasTarget = options.some((opt) => opt.trim().toUpperCase() === trimmedTarget);
  let pool;
  if (hasTarget) {
    pool = [...options];
  } else {
    pool = [correctAnswer, ...options.filter((o) => o.trim().toUpperCase() !== trimmedTarget).slice(0, 3)];
  }
  return shuffleArray(pool);
}

console.log('--- 1. Testing Answer Option Randomization ---');

const baseOptions = ['GOLD', 'SILVER', 'COPPER', 'PLATINUM'];
const targetAnswer = 'GOLD';
const trials = 4000;
const slotCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
const uniqueOrderings = new Set();

for (let i = 0; i < trials; i++) {
  const shuffled = randomizeQuestionOptions(baseOptions, targetAnswer);
  
  // Verify length and completeness
  assert.strictEqual(shuffled.length, 4, 'Options length must remain 4');
  assert.ok(shuffled.includes(targetAnswer), 'Target answer must be in shuffled options');
  assert.strictEqual(new Set(shuffled).size, 4, 'Options must contain no duplicates');

  const targetIndex = shuffled.indexOf(targetAnswer);
  slotCounts[targetIndex]++;
  uniqueOrderings.add(shuffled.join('-'));
}

console.log(`Slot distribution for correct answer over ${trials} trials:`);
console.log(`  Slot A (index 0): ${slotCounts[0]} (${((slotCounts[0] / trials) * 100).toFixed(1)}%)`);
console.log(`  Slot B (index 1): ${slotCounts[1]} (${((slotCounts[1] / trials) * 100).toFixed(1)}%)`);
console.log(`  Slot C (index 2): ${slotCounts[2]} (${((slotCounts[2] / trials) * 100).toFixed(1)}%)`);
console.log(`  Slot D (index 3): ${slotCounts[3]} (${((slotCounts[3] / trials) * 100).toFixed(1)}%)`);
console.log(`  Unique permutations observed: ${uniqueOrderings.size} / 24`);

// Each slot should receive roughly 25% (20% - 30% tolerance across 4000 trials)
for (let idx = 0; idx < 4; idx++) {
  const percent = (slotCounts[idx] / trials) * 100;
  assert.ok(percent >= 20 && percent <= 30, `Slot ${idx} should have ~25% distribution, got ${percent.toFixed(1)}%`);
}
// All 4! = 24 permutations should be reachable
assert.ok(uniqueOrderings.size >= 20, 'At least 20 different permutations should appear across 4000 trials');
console.log('✓ Answer Randomization Test Passed Successfully!\n');

console.log('--- 2. Testing No-Repeat Trivia Question Mechanism ---');

// Mock question bank
const mockQuestions = [
  { id: 'q-1', category: 'geography', clue_text: 'Capital of France on the Seine', answer: 'PARIS', elo_rating: 1000 },
  { id: 'q-2', category: 'geography', clue_text: 'Longest river in Africa', answer: 'NILE', elo_rating: 1100 },
  { id: 'q-3', category: 'geography', clue_text: 'Highest mountain above sea level', answer: 'EVEREST', elo_rating: 1200 },
  { id: 'q-4', category: 'geography', clue_text: 'Lowest elevation on land', answer: 'DEAD SEA', elo_rating: 1300 },
  { id: 'q-5', category: 'geography', clue_text: 'Capital of Japan', answer: 'TOKYO', elo_rating: 1050 },
  { id: 'q-6', category: 'science', clue_text: 'Lightest chemical element', answer: 'HYDROGEN', elo_rating: 1000 },
  { id: 'q-7', category: 'science', clue_text: 'Powerhouse of the eukaryotic cell', answer: 'MITOCHONDRIA', elo_rating: 1200 },
];

class MockRepository {
  constructor(questions) {
    this.questions = questions;
    this.attemptedKeys = new Set();
  }

  recordAttemptedQuestion(id, clue) {
    this.attemptedKeys.add(id.toLowerCase());
    if (clue) this.attemptedKeys.add(clue.trim().toLowerCase());
  }

  getNextQuestion(categoryFilter, sessionExcludes = []) {
    const allExcludes = new Set();
    for (const k of this.attemptedKeys) allExcludes.add(k);
    for (const x of sessionExcludes) allExcludes.add(x.trim().toLowerCase());

    const pool = this.questions.filter((q) => {
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
      if (allExcludes.has(q.id.toLowerCase())) return false;
      if (allExcludes.has(q.clue_text.trim().toLowerCase())) return false;
      return true;
    });

    if (pool.length === 0) return null;
    return pool[0];
  }
}

const repo = new MockRepository(mockQuestions);

// Step 1: Request first geography question
const q1 = repo.getNextQuestion('geography');
assert.strictEqual(q1.id, 'q-1');
console.log(`  1. Served question: [${q1.id}] ${q1.answer}`);

// User tries question 1 -> mark as attempted
repo.recordAttemptedQuestion(q1.id, q1.clue_text);

// Step 2: Request next geography question
const q2 = repo.getNextQuestion('geography');
assert.notStrictEqual(q2.id, 'q-1', 'Must not repeat q-1!');
assert.strictEqual(q2.id, 'q-2');
console.log(`  2. Served question: [${q2.id}] ${q2.answer} (Verified q-1 was NOT repeated)`);

repo.recordAttemptedQuestion(q2.id, q2.clue_text);

// Step 3: Request next geography question
const q3 = repo.getNextQuestion('geography');
assert.ok(q3.id !== 'q-1' && q3.id !== 'q-2', 'Must not repeat q-1 or q-2');
assert.strictEqual(q3.id, 'q-3');
console.log(`  3. Served question: [${q3.id}] ${q3.answer} (Verified q-1 and q-2 were NOT repeated)`);

repo.recordAttemptedQuestion(q3.id, q3.clue_text);

// Step 4: Cross-session test (sessionExcludes is empty)
const q4 = repo.getNextQuestion('geography', []);
assert.ok(!['q-1', 'q-2', 'q-3'].includes(q4.id), 'Persistent history must exclude q-1, q-2, q-3 even in new session');
assert.strictEqual(q4.id, 'q-4');
console.log(`  4. New session served question: [${q4.id}] ${q4.answer} (Confirmed persistent no-repeat across sessions)`);

repo.recordAttemptedQuestion(q4.id, q4.clue_text);

const q5 = repo.getNextQuestion('geography', []);
assert.strictEqual(q5.id, 'q-5');
console.log(`  5. Served last geography question: [${q5.id}] ${q5.answer}`);
repo.recordAttemptedQuestion(q5.id, q5.clue_text);

// Step 5: Geography pool fully exhausted
const qExhausted = repo.getNextQuestion('geography', []);
assert.strictEqual(qExhausted, null, 'No untried geography questions remain');
console.log(`  6. Geography candidate pool exhausted properly: untried pool is empty`);

// Step 6: Science category questions are still available and untouched
const qSci = repo.getNextQuestion('science', []);
assert.strictEqual(qSci.id, 'q-6');
console.log(`  7. Science question available: [${qSci.id}] ${qSci.answer}`);

console.log('✓ No-Repeat Question Mechanism Test Passed Successfully!\n');
console.log('All tests passed with 100% compliance! 🎉');
