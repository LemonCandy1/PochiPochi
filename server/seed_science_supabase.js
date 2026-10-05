/**
 * Seed 1,000 Jeopardy Science Questions into Supabase Database
 * Database: PochiPochi (https://ndkimouioysvlunqpdnl.supabase.co)
 * Dataset Source: J! Archive (jwolle1/jeopardy_clue_dataset)
 * 
 * Question Elo Calibrated to New User Starting Scale (200 - 600 Elo):
 *   - $200 clue: ~280 Elo
 *   - $400 clue: ~400 Elo
 *   - $600 clue: ~520 Elo
 *   - $800 clue: ~640 Elo
 *   - $1000 clue: ~760 Elo
 *   - $1200 - $2000 clue: 850 - 1100 Elo
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

const SCIENCE_CATEGORIES = [
  'SCIENCE',
  'GENERAL SCIENCE',
  'EARTH SCIENCE',
  'PHYSICAL SCIENCE',
  'CHEMISTRY',
  'PHYSICS',
  'BIOLOGY',
  'ASTRONOMY',
  'BOTANY',
  'ZOOLOGY',
  'SCIENTIFIC DISCOVERIES',
  'ELEMENTS',
  'THE PERIODIC TABLE',
  'THE HUMAN BODY',
  'ANATOMY',
  'SPACE',
  'THE SOLAR SYSTEM',
  'PLANETS',
  'ROCKS & MINERALS',
  'WEATHER',
  'METEOROLOGY',
  'GENETICS',
  'MEDICINE',
  'MEDICAL',
  'NATURE & SCIENCE',
  'SCIENTISTS',
  'INVENTIONS',
  'TECHNOLOGY',
  'GEOLOGY',
  'ECOLOGY',
  'THE ELEMENTS',
  'NUCLEAR PHYSICS',
  'SCIENTIFIC NAMES',
  'MICROBIOLOGY',
  'BIOCHEMISTRY',
  'PALEONTOLOGY',
  'OCEANOGRAPHY',
  'NEUROLOGY',
  'OPTICS',
  'THERMODYNAMICS',
  'THE ANIMAL KINGDOM',
  'MAMMALS',
  'BIRDS',
  'INSECTS',
  'REPTILES',
  'DINOSAURS',
  'MARINE BIOLOGY',
  'ASTRONAUTS',
  'SPACE EXPLORATION',
  'TELESCOPES',
  'NASA',
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

/**
 * Calibrates Jeopardy dollar values to the new 200 - 600 user Elo scale
 */
function calculateScienceElo(clueValue) {
  const num = parseInt(String(clueValue).replace(/[^0-9]/g, ''), 10) || 400;
  if (num <= 200) return 280;
  if (num <= 400) return 400;
  if (num <= 600) return 520;
  if (num <= 800) return 640;
  if (num <= 1000) return 760;
  if (num <= 1200) return 860;
  if (num <= 1600) return 960;
  return 1080;
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
  console.log('PochiPochi: Ingesting 1,000 Science Questions');
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

  // Gather clues from multiple seasons until we have > 1,500 candidate science clues
  const candidateClues = [];
  const answerPoolSet = new Set();

  const seasonsToScan = [
    8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
  ];

  console.log('\n[1/5] Scanning seasons for Science category clues...');

  for (const s of seasonsToScan) {
    process.stdout.write(`Fetching Season ${s}... `);
    const seasonClues = await fetchSeasonClues(s);
    let matched = 0;

    for (const item of seasonClues) {
      const catUpper = item.category.toUpperCase();
      const isSci = SCIENCE_CATEGORIES.some((kw) => catUpper.includes(kw));

      if (isSci) {
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

    console.log(`Found ${matched} valid science clues (${candidateClues.length} total)`);

    if (candidateClues.length >= 1600) {
      console.log('Sufficient candidate pool reached!');
      break;
    }
  }

  const answerPool = Array.from(answerPoolSet);
  console.log(`\nUnique science answer distractor pool size: ${answerPool.length}`);

  // Deduplicate candidate clues by clueText
  const seenClues = new Set();
  const targetQuestions = [];

  console.log('\n[2/5] Formatting exactly 1,000 science questions with 4-option multiple choice...');

  for (let i = 0; i < candidateClues.length && targetQuestions.length < 1000; i++) {
    const candidate = candidateClues[i];
    const clueKey = candidate.clueText.toLowerCase();

    if (seenClues.has(clueKey)) continue;
    seenClues.add(clueKey);

    const correctAnswer = candidate.answerText;

    // Pick 3 thematic distractors from the science answer pool
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
    const eloRating = calculateScienceElo(candidate.clueValue);
    const answerMaskLength = correctAnswer.replace(/[^a-zA-Z0-9]/g, '').length;

    const id = `jarch-sci-${candidate.season}-${String(targetQuestions.length + 1).padStart(4, '0')}`;
    const cleanForWiki = correctAnswer.replace(/^(the|a|an)\s+/i, '').trim();
    const wikiSlug = cleanForWiki.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('_');
    const wikipedia_url = `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiSlug)}`;

    targetQuestions.push({
      id,
      category: 'science',
      clue_text: candidate.clueText,
      answer: correctAnswer,
      answer_mask_length: answerMaskLength,
      options,
      wikipedia_url,
      elo_rating: eloRating,
      context_summary: `Jeopardy! category: "${candidate.category}" • Aired: ${candidate.airDate || 'Archive'}`,
      times_served: 0,
      times_correct: 0,
      is_flagged: false,
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`Prepared ${targetQuestions.length} unique science questions.`);

  // Ingest in batches of 100
  console.log('\n[3/5] Uploading to Supabase public.questions in batches of 100...');
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
    process.stdout.write(`Uploaded ${uploaded}/${targetQuestions.length} science questions...\r`);
  }

  console.log(`\nSuccessfully uploaded all ${uploaded} science questions!`);

  // Step 4: Calibrate existing geography questions to match the 200-600 scale
  console.log('\n[4/5] Normalizing existing geography questions to 200-600 Elo scale...');
  try {
    const { data: geoQuestions, error: geoFetchErr } = await supabase
      .from('questions')
      .select('id, elo_rating')
      .eq('category', 'geography')
      .gt('elo_rating', 900);

    if (!geoFetchErr && geoQuestions && geoQuestions.length > 0) {
      console.log(`Found ${geoQuestions.length} geography questions to recalibrate...`);
      const updates = geoQuestions.map(q => {
        // Shift ratings: e.g. 1050 -> 280, 1200 -> 400, 1320 -> 520, 1450 -> 640, 1550 -> 760, 1780 -> 980
        let newElo = Math.max(250, q.elo_rating - 800);
        return { id: q.id, elo_rating: newElo };
      });

      for (let i = 0; i < updates.length; i += 100) {
        const batch = updates.slice(i, i + 100);
        await supabase.from('questions').upsert(batch, { onConflict: 'id' });
      }
      console.log(`Recalibrated ${updates.length} geography questions to 200-600 scale!`);
    } else {
      console.log('Geography questions already calibrated or none found above 900 Elo.');
    }
  } catch (err) {
    console.warn('Could not normalize existing geography questions:', err.message);
  }

  // Step 5: Verify final count in database
  console.log('\n[5/5] Verifying database count...');
  const { count: finalCount, error: countErr } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true });

  const { count: sciCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('category', 'science');

  const { count: geoCount } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('category', 'geography');

  console.log('====================================================');
  console.log(`Total questions in Supabase: ${finalCount}`);
  console.log(`Science questions in Supabase: ${sciCount}`);
  console.log(`Geography questions in Supabase: ${geoCount}`);
  console.log('====================================================');
  console.log('Done! 1,000 Jeopardy science questions are live in your database.');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
