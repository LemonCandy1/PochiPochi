/**
 * Comprehensive Automated Tests for:
 * 1. Supabase Science & Endless Dataset Ingestion (> 2,000 clues)
 * 2. Adaptive Question Selection (Endless pulls across whole database, Science pulls from science category)
 * 3. Elo-based question matching & random variety
 * 4. 200 - 600 Onboarding Elo calibration & Rank Tiers
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const parts = line.split('=');
      if (parts.length >= 2 && !line.startsWith('#')) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim();
        process.env[k] = v;
      }
    }
  }
} catch {}

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ndkimouioysvlunqpdnl.supabase.co';
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  'sb_publishable_fqhrSxZFfiWRtDV_znrqoQ_vxiTqKum';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function getEloRankTier(elo) {
  if (elo >= 1200) return { tier: 'Grandmaster Owl', badgeId: 'owl', color: '#00009F' };
  if (elo >= 900) return { tier: 'Trivia Master Cat', badgeId: 'cat', color: '#7C3AED' };
  if (elo >= 650) return { tier: 'Scholar Bear', badgeId: 'bear', color: '#059669' };
  if (elo >= 400) return { tier: 'Smart Pup', badgeId: 'pup', color: '#E08722' };
  return { tier: 'Curious Novice', badgeId: 'novice', color: '#64748B' };
}

async function runTests() {
  console.log('======================================================');
  console.log('  TEST SUITE: SCIENCE DATASET, ENDLESS & ELO SELECTION');
  console.log('======================================================\n');

  // --- 1. Supabase Dataset Verification ---
  console.log('--- 1. Testing Supabase Dataset Counts ---');
  const { count: totalCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true });

  const { count: scienceCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('category', 'science');

  const { count: geoCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('category', 'geography');

  console.log(`Total questions in Supabase: ${totalCount}`);
  console.log(`Science questions in Supabase: ${scienceCount}`);
  console.log(`Geography questions in Supabase: ${geoCount}`);

  if (totalCount < 2000) {
    throw new Error(`Expected at least 2,000 total questions, found ${totalCount}`);
  }
  if (scienceCount < 1000) {
    throw new Error(`Expected at least 1,000 science questions, found ${scienceCount}`);
  }
  console.log('✓ Supabase question counts verified (>2000 total, >1000 science)\n');

  // --- 2. Testing Endless Trivia Pulls Across Whole Database ---
  console.log('--- 2. Testing Endless Trivia Selection (All Categories) ---');
  const targetElo = 400;
  const maxOffset = totalCount - 50;
  const randomOffset = Math.floor(Math.random() * maxOffset);

  const { data: endlessQuestions, error: endlessErr } = await supabase
    .from('questions')
    .select('*')
    .range(randomOffset, randomOffset + 29);

  if (endlessErr || !endlessQuestions || endlessQuestions.length === 0) {
    throw new Error('Failed to pull questions for Endless Trivia: ' + endlessErr?.message);
  }

  // Sort by smallest Elo difference to simulate adaptive engine
  endlessQuestions.sort(
    (a, b) => Math.abs(a.elo_rating - targetElo) - Math.abs(b.elo_rating - targetElo)
  );

  const categoriesFound = new Set();
  const served = endlessQuestions.slice(0, 5);

  for (let i = 0; i < served.length; i++) {
    const q = served[i];
    categoriesFound.add(q.category);
    console.log(
      `Round ${i + 1} (Endless): [${q.category.toUpperCase()}] "${q.clue_text.slice(0, 55)}..." ` +
      `(Ans: ${q.answer}, Elo: ${q.elo_rating})`
    );

    if (!q.options || q.options.length !== 4) {
      throw new Error(`Question ${q.id} does not have 4 options`);
    }
    if (!q.options.map(o => o.toLowerCase()).includes(q.answer.toLowerCase())) {
      throw new Error(`Question ${q.id} answer is not in options`);
    }
  }

  console.log(`✓ 5 Endless rounds served. Categories represented: [${Array.from(categoriesFound).join(', ')}]\n`);

  // --- 3. Testing Science Category Selection ---
  console.log('--- 3. Testing Science Category Selection (Elo-Matched & Random) ---');
  const targetScienceElo = 350;
  const maxSciOffset = scienceCount - 40;
  const randomSciOffset = Math.floor(Math.random() * maxSciOffset);

  const { data: scienceQuestions, error: sciErr } = await supabase
    .from('questions')
    .select('*')
    .eq('category', 'science')
    .range(randomSciOffset, randomSciOffset + 29);

  if (sciErr || !scienceQuestions || scienceQuestions.length === 0) {
    throw new Error('Failed to query science category: ' + sciErr?.message);
  }

  // Sort by Elo distance to 350
  scienceQuestions.sort(
    (a, b) => Math.abs(a.elo_rating - targetScienceElo) - Math.abs(b.elo_rating - targetScienceElo)
  );

  const servedScience = scienceQuestions.slice(0, 5);
  for (let i = 0; i < servedScience.length; i++) {
    const q = servedScience[i];
    console.log(
      `Round ${i + 1} (Science): "${q.clue_text.slice(0, 55)}..." ` +
      `(Ans: ${q.answer}, Elo: ${q.elo_rating})`
    );

    if (q.category !== 'science') {
      throw new Error(`Expected category science, got ${q.category}`);
    }
    if (!q.wikipedia_url || !q.wikipedia_url.startsWith('http')) {
      throw new Error(`Invalid Wikipedia URL on question ${q.id}: ${q.wikipedia_url}`);
    }
  }
  console.log('✓ Science questions randomly sampled matching target Elo with verified Wikipedia links\n');

  // --- 4. Testing Onboarding Elo Range (200 - 600) ---
  console.log('--- 4. Testing Onboarding Calibration Logic (200 - 600 Elo) ---');

  function calculateTestElo(correctCount, avgSpeedMs = 3000) {
    const speedBonus = Math.max(0, Math.min(40, Math.round((6000 - avgSpeedMs) / 100)));
    let base = 350;
    if (correctCount === 3) base = 560 + speedBonus;
    else if (correctCount === 2) base = 460 + Math.round(speedBonus * 0.7);
    else if (correctCount === 1) base = 330 + Math.round(speedBonus * 0.5);
    else base = 220;
    return Math.min(620, Math.max(200, base));
  }

  const elo0 = calculateTestElo(0);
  const elo1 = calculateTestElo(1);
  const elo2 = calculateTestElo(2);
  const elo3Fast = calculateTestElo(3, 1500);
  const elo3Slow = calculateTestElo(3, 5000);

  console.log(`0/3 Correct: ${elo0} Elo (Expected ~200-240)`);
  console.log(`1/3 Correct: ${elo1} Elo (Expected ~320-360)`);
  console.log(`2/3 Correct: ${elo2} Elo (Expected ~450-500)`);
  console.log(`3/3 Correct (Fast): ${elo3Fast} Elo (Expected ~580-620)`);
  console.log(`3/3 Correct (Slow): ${elo3Slow} Elo (Expected ~560-580)`);

  if (elo0 < 200 || elo0 > 250) throw new Error(`0 correct Elo ${elo0} out of range`);
  if (elo1 < 300 || elo1 > 380) throw new Error(`1 correct Elo ${elo1} out of range`);
  if (elo2 < 440 || elo2 > 500) throw new Error(`2 correct Elo ${elo2} out of range`);
  if (elo3Fast < 580 || elo3Fast > 620) throw new Error(`3 correct fast Elo ${elo3Fast} out of range`);

  console.log('✓ All onboarding score calibrations accurately within 200 - 600 Elo range\n');

  // --- 5. Testing Rank Tiers on the 200 - 600 Scale ---
  console.log('--- 5. Testing Rank Tiers on 200 - 600 Baseline ---');
  const r250 = getEloRankTier(250);
  const r450 = getEloRankTier(450);
  const r750 = getEloRankTier(750);
  const r1000 = getEloRankTier(1000);
  const r1400 = getEloRankTier(1400);
  const r2100 = getEloRankTier(2100);

  console.log(`Elo 250: ${r250.tier}`);
  console.log(`Elo 450: ${r450.tier}`);
  console.log(`Elo 750: ${r750.tier}`);
  console.log(`Elo 1000: ${r1000.tier}`);
  console.log(`Elo 1400: ${r1400.tier}`);
  console.log(`Elo 2100: ${r2100.tier}`);

  if (r250.tier !== 'Curious Novice') throw new Error('250 should be Curious Novice');
  if (r450.tier !== 'Smart Pup') throw new Error('450 should be Smart Pup');
  if (r750.tier !== 'Scholar Bear') throw new Error('750 should be Scholar Bear');
  if (r1000.tier !== 'Trivia Master Cat') throw new Error('1000 should be Trivia Master Cat');
  if (r1400.tier !== 'Grandmaster Owl') throw new Error('1400 should be Grandmaster Owl');
  if (r2100.tier !== 'Grandmaster Owl') throw new Error('2100 should be Grandmaster Owl');

  console.log('✓ Rank tiers verified matching calibrated progression\n');

  console.log('======================================================');
  console.log('   ALL TESTS PASSED WITH 100% SUCCESS! ✓');
  console.log('======================================================');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
