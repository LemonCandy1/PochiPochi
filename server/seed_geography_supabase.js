/**
 * Seed 1,000 Jeopardy Geography Questions into Supabase Database
 * Database: PochiPochi (https://ndkimouioysvlunqpdnl.supabase.co)
 * Dataset Source: J! Archive (jwolle1/jeopardy_clue_dataset)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

const GEOGRAPHY_CATEGORIES = [
  'GEOGRAPHY',
  'WORLD GEOGRAPHY',
  'U.S. GEOGRAPHY',
  'US GEOGRAPHY',
  'WORLD CAPITALS',
  'STATE CAPITALS',
  'CAPITALS',
  'LAKES & RIVERS',
  'RIVERS',
  'LAKES',
  'MOUNTAINS',
  'ISLANDS',
  'AFRICA',
  'ASIA',
  'EUROPE',
  'SOUTH AMERICA',
  'CENTRAL AMERICA',
  'THE CARIBBEAN',
  'BODIES OF WATER',
  'OCEANS',
  'SEAS',
  'DESERTS',
  'VOLCANOES',
  'BORDERS',
  'COUNTRIES',
  'NATIONS',
  'WORLD CITIES',
  'CITIES',
  'PENINSULAS',
  'WHERE AM I?',
  'MAPS',
  'LANDMARKS',
  'NATIONAL PARKS',
  'STRAITS & CANALS',
];

function cleanHtml(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .trim();
}

function cleanAnswer(ans) {
  if (!ans) return '';
  let cleaned = cleanHtml(ans);
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, '').trim();
  cleaned = cleaned.replace(/^(the|a|an)\s+/i, '').trim();
  cleaned = cleaned.replace(/^["']+|["',.]+$/g, '').trim();
  return cleaned;
}

function calculateElo(clueValue) {
  const val = parseInt(clueValue, 10) || 400;
  if (val <= 200) return 1050;
  if (val <= 400) return 1200;
  if (val <= 600) return 1320;
  if (val <= 800) return 1450;
  if (val <= 1000) return 1550;
  if (val <= 1600) return 1680;
  return 1780;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function fetchSeasonClues(seasonNum) {
  const url = `https://raw.githubusercontent.com/jwolle1/jeopardy_clue_dataset/master/seasons/season${seasonNum}.tsv`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.split('\n');
    const rawClues = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split('\t');
      if (cols.length < 8) continue;

      const round = cols[0];
      const clueValue = cols[1];
      const category = (cols[3] || '').trim();
      const rawClue = cols[5] || '';
      const rawAnswer = cols[6] || '';
      const airDate = cols[7] || '';

      rawClues.push({
        round,
        clueValue,
        category,
        rawClue,
        rawAnswer,
        airDate,
      });
    }
    return rawClues;
  } catch (err) {
    console.warn(`Failed to fetch season ${seasonNum}:`, err.message);
    return [];
  }
}

async function main() {
  console.log('====================================================');
  console.log('PochiPochi: Ingesting 1,000 Geography Questions');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log('====================================================\n');

  // Verify connection
  const { count: initialCount, error: checkErr } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true });

  if (checkErr) {
    console.error('Failed to connect to Supabase questions table:', checkErr);
    process.exit(1);
  }

  console.log(`Current questions in database: ${initialCount}`);

  // Gather clues from multiple seasons until we have > 1,500 candidate clues
  const candidateClues = [];
  const answerPoolSet = new Set();

  const seasonsToScan = [
    10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
  ];

  console.log('\n[1/4] Scanning seasons for Geography category clues...');

  for (const s of seasonsToScan) {
    process.stdout.write(`Fetching Season ${s}... `);
    const seasonClues = await fetchSeasonClues(s);
    let matched = 0;

    for (const item of seasonClues) {
      const catUpper = item.category.toUpperCase();
      const isGeo = GEOGRAPHY_CATEGORIES.some((kw) => catUpper.includes(kw));

      if (isGeo) {
        const clueText = cleanHtml(item.rawClue);
        const answerText = cleanAnswer(item.rawAnswer);

        // Quality filters
        if (
          !clueText ||
          !answerText ||
          clueText.length < 25 ||
          clueText.length > 280 ||
          answerText.length < 2 ||
          answerText.length > 35 ||
          clueText.toLowerCase().includes('(seen here)') ||
          clueText.toLowerCase().includes('(heard here)') ||
          clueText.toLowerCase().includes('(video clue)') ||
          clueText.toLowerCase().includes('(audio clue)') ||
          clueText.toLowerCase().includes('(alex:')
        ) {
          continue;
        }

        candidateClues.push({
          season: s,
          clueValue: item.clueValue,
          category: item.category,
          clueText,
          answerText,
          airDate: item.airDate,
        });

        answerPoolSet.add(answerText);
        matched++;
      }
    }

    console.log(`Found ${matched} valid geography clues (${candidateClues.length} total)`);

    if (candidateClues.length >= 1400) {
      console.log('Sufficient candidate pool reached!');
      break;
    }
  }

  const answerPool = Array.from(answerPoolSet);
  console.log(`\nUnique answer distractor pool size: ${answerPool.length}`);

  // Deduplicate candidate clues by clueText
  const seenClues = new Set();
  const targetQuestions = [];

  console.log('\n[2/4] Formatting exactly 1,000 questions with 4-option multiple choice...');

  for (let i = 0; i < candidateClues.length && targetQuestions.length < 1000; i++) {
    const candidate = candidateClues[i];
    const clueKey = candidate.clueText.toLowerCase();

    if (seenClues.has(clueKey)) continue;
    seenClues.add(clueKey);

    const correctAnswer = candidate.answerText;

    // Pick 3 distractors from the geography answer pool
    const distractors = [];
    const poolShuffled = shuffle(answerPool);

    for (const dist of poolShuffled) {
      if (
        dist.toLowerCase() !== correctAnswer.toLowerCase() &&
        !distractors.includes(dist)
      ) {
        distractors.push(dist);
        if (distractors.length === 3) break;
      }
    }

    if (distractors.length < 3) continue;

    const options = shuffle([correctAnswer, ...distractors]);
    const eloRating = calculateElo(candidate.clueValue);
    const answerMaskLength = correctAnswer.replace(/[^a-zA-Z0-9]/g, '').length;

    const id = `jarch-geo-${candidate.season}-${String(targetQuestions.length + 1).padStart(4, '0')}`;

    targetQuestions.push({
      id,
      category: 'geography',
      clue_text: candidate.clueText,
      answer: correctAnswer,
      answer_mask_length: answerMaskLength,
      options,
      elo_rating: eloRating,
      context_summary: `Jeopardy! category: "${candidate.category}" • Aired: ${candidate.airDate || 'Archive'}`,
      times_served: 0,
      times_correct: 0,
      is_flagged: false,
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`Prepared ${targetQuestions.length} unique geography questions.`);

  // Ingest in batches of 100
  console.log('\n[3/4] Uploading to Supabase public.questions in batches of 100...');
  const BATCH_SIZE = 100;
  let uploaded = 0;

  for (let i = 0; i < targetQuestions.length; i += BATCH_SIZE) {
    const batch = targetQuestions.slice(i, i + BATCH_SIZE);
    const { error: insertErr } = await supabase
      .from('questions')
      .upsert(batch, { onConflict: 'id' });

    if (insertErr) {
      console.error(`Error uploading batch ${i / BATCH_SIZE + 1}:`, insertErr);
      process.exit(1);
    }

    uploaded += batch.length;
    process.stdout.write(`Uploaded ${uploaded}/${targetQuestions.length} questions...\r`);
  }

  console.log(`\nSuccessfully uploaded all ${uploaded} geography questions!`);

  // Verify final count in database
  console.log('\n[4/4] Verifying database count...');
  const { count: finalCount, error: countErr } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true });

  const { count: geoCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('category', 'geography');

  console.log('====================================================');
  console.log(`Total questions in Supabase: ${finalCount}`);
  console.log(`Geography questions in Supabase: ${geoCount}`);
  console.log('====================================================');
  console.log('Done! 1,000 Jeopardy geography questions are live in your database.');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
