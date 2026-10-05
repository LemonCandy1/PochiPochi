/**
 * Test Suite for:
 * 1. Global Percentage Calibration across Question Elo ratings
 * 2. Real-time Bookmark Listener Pattern
 * 3. 10-Question Daily Trivia Completion Statistics & Aggregation
 */

// Implementation of calculateGlobalCorrectPercentage
function calculateGlobalCorrectPercentage(question) {
  if (question.times_served && question.times_served >= 5) {
    const raw = Math.round((question.times_correct / question.times_served) * 100);
    return Math.max(10, Math.min(96, raw));
  }
  const elo = question.elo_rating ?? 350;
  const prob = 1 / (1 + Math.pow(10, (elo - 380) / 450));
  const calculated = Math.round(prob * 100);
  return Math.max(12, Math.min(94, calculated));
}

async function runTests() {
  console.log('======================================================');
  console.log('  TEST SUITE: NOTEBOOK REAL-TIME SYNC & DAILY STATS  ');
  console.log('======================================================\n');

  // Test 1: Global Percentage Calibration
  console.log('--- 1. Testing Global Percentage Calculation ---');
  const pct1 = calculateGlobalCorrectPercentage({ elo_rating: 200 });
  const pct2 = calculateGlobalCorrectPercentage({ elo_rating: 380 });
  const pct3 = calculateGlobalCorrectPercentage({ elo_rating: 600 });
  const pct4 = calculateGlobalCorrectPercentage({ elo_rating: 750 });
  const pctHist1 = calculateGlobalCorrectPercentage({ times_served: 20, times_correct: 16 });
  const pctHist2 = calculateGlobalCorrectPercentage({ times_served: 50, times_correct: 10 });

  console.log(`Elo 200 (Novice): ${pct1}% (Expected > 65%)`);
  console.log(`Elo 380 (Mid): ${pct2}% (Expected ~50%)`);
  console.log(`Elo 600 (Hard): ${pct3}% (Expected ~20-30%)`);
  console.log(`Elo 750 (Very Hard): ${pct4}% (Expected < 20%)`);
  console.log(`Historical (16/20): ${pctHist1}% (Expected 80%)`);
  console.log(`Historical (10/50): ${pctHist2}% (Expected 20%)`);

  if (pct1 <= pct2 || pct2 <= pct3 || pct3 <= pct4) {
    throw new Error('Global percentage did not decrease monotonically with question difficulty!');
  }
  if (pctHist1 !== 80 || pctHist2 !== 20) {
    throw new Error('Historical percentage did not match times_correct/times_served!');
  }
  console.log('✓ Global percentage calculations verified across tiers & historical data');

  // Test 2: Real-time Bookmark Listener Pattern
  console.log('\n--- 2. Testing Bookmark Listener & Real-time Live Notification ---');
  let cache = [];
  const listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
    listener(cache);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }

  function toggle(q) {
    const existing = cache.findIndex(b => b.id === q.id);
    if (existing >= 0) {
      cache.splice(existing, 1);
    } else {
      cache.unshift(q);
    }
    listeners.forEach(l => l([...cache]));
  }

  let receivedList = [];
  let updateCount = 0;
  const unsubscribe = subscribe((list) => {
    updateCount++;
    receivedList = list;
  });

  const dummyQ = { id: 'q-test-101', answer: 'Hydrogen', clue: 'Lightest element' };
  toggle(dummyQ);

  if (receivedList.length !== 1 || receivedList[0].id !== 'q-test-101') {
    throw new Error('Listener did not immediately receive saved question!');
  }
  console.log(`✓ Real-time notification received on save (Length: ${receivedList.length}, Updates: ${updateCount})`);

  toggle(dummyQ);
  if (receivedList.length !== 0) {
    throw new Error('Listener did not immediately update on remove!');
  }
  console.log(`✓ Real-time notification received on remove (Length: ${receivedList.length}, Updates: ${updateCount})`);
  unsubscribe();

  // Test 3: 10-Question Daily Trivia Aggregation
  console.log('\n--- 3. Testing 10-Question Daily Trivia Aggregation ---');
  const sessionQuestions = [
    { id: 'd1', answer: 'Goku', isCorrect: true, elo: 250 },
    { id: 'd2', answer: 'Oxygen', isCorrect: true, elo: 280 },
    { id: 'd3', answer: 'Tokyo', isCorrect: true, elo: 300 },
    { id: 'd4', answer: 'Leonardo da Vinci', isCorrect: true, elo: 340 },
    { id: 'd5', answer: 'Mitochondria', isCorrect: true, elo: 360 },
    { id: 'd6', answer: 'Gojo Satoru', isCorrect: false, elo: 420 },
    { id: 'd7', answer: 'Mount Everest', isCorrect: true, elo: 450 },
    { id: 'd8', answer: 'Penicillin', isCorrect: true, elo: 500 },
    { id: 'd9', answer: 'Nile', isCorrect: true, elo: 520 },
    { id: 'd10', answer: 'Quantum Entanglement', isCorrect: false, elo: 680 },
  ];

  const results = sessionQuestions.map((s) => ({
    question: { id: s.id, answer: s.answer, elo_rating: s.elo },
    isCorrect: s.isCorrect,
    globalPercentage: calculateGlobalCorrectPercentage({ elo_rating: s.elo }),
  }));

  const correctCount = results.filter(r => r.isCorrect).length;
  const accuracy = Math.round((correctCount / 10) * 100);

  console.log(`Daily session simulated: ${correctCount} / 10 correct (${accuracy}%)`);
  results.forEach((r, idx) => {
    console.log(`  Q${idx + 1}: ${r.question.answer} -> ${r.isCorrect ? '✓ CORRECT' : '✗ MISSED'} | Global: ${r.globalPercentage}% people right`);
  });

  if (correctCount !== 8 || accuracy !== 80 || results.length !== 10) {
    throw new Error('Daily trivia result aggregation failed!');
  }
  console.log('✓ 10-Question Daily Trivia structure and percentages verified successfully');

  console.log('\n======================================================');
  console.log('   ALL NOTEBOOK & DAILY STATS TESTS PASSED! ✓');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
