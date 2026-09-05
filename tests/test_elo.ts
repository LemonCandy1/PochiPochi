import { calculateDualElo, getEloRankTier } from '../src/engine/eloEngine';

function runTests() {
  console.log('--- Testing Dual-Sided Elo Engine ---');

  // Test 1: Player wins with early buzz (progress = 0.1)
  const result1 = calculateDualElo({
    playerElo: 1200,
    questionElo: 1200,
    isCorrect: true,
    buzzProgressRatio: 0.1,
  });

  console.log('Test 1 (Early Buzz Win):', result1);
  if (result1.deltaPlayer <= 0) throw new Error('Player Elo should increase on win');
  if (result1.deltaQuestion >= 0) throw new Error('Question Elo should decrease on win');
  if (result1.speedMultiplier <= 1.2) throw new Error('Speed multiplier should be high for early buzz');
  console.log('✓ Test 1 Passed');

  // Test 2: Player loses with late buzz (progress = 0.9)
  const result2 = calculateDualElo({
    playerElo: 1200,
    questionElo: 1200,
    isCorrect: false,
    buzzProgressRatio: 0.9,
  });

  console.log('Test 2 (Late Buzz Loss):', result2);
  if (result2.deltaPlayer >= 0) throw new Error('Player Elo should decrease on loss');
  if (result2.deltaQuestion <= 0) throw new Error('Question Elo should increase on loss');
  if (result2.speedMultiplier >= 1.2) throw new Error('Speed multiplier should be lower for late buzz');
  console.log('✓ Test 2 Passed');

  // Test 3: Rank tiers
  const tier1 = getEloRankTier(1100);
  const tier2 = getEloRankTier(1550);
  const tier3 = getEloRankTier(2100);
  console.log('Test 3 (Rank Tiers):', { tier1, tier2, tier3 });
  if (tier3.tier !== 'Grandmaster Owl') throw new Error('Rank tier 2100 should be Grandmaster Owl');
  console.log('✓ Test 3 Passed');

  console.log('\nAll Elo Engine Tests Passed Successfully!');
}

runTests();
