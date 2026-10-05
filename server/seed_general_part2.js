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
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    }
  }
} catch {}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ndkimouioysvlunqpdnl.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable_fqhrSxZFfiWRtDV_znrqoQ_vxiTqKum';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GENERAL_CATEGORIES = [
  'HISTORY', 'WORLD HISTORY', 'AMERICAN HISTORY', 'U.S. HISTORY', 'EUROPEAN HISTORY', 'ANCIENT HISTORY',
  'LITERATURE', 'AUTHORS', 'BOOKS', 'NOVELS', 'POETRY', 'POETS', 'SHAKESPEARE', 'PLAYS & PLAYWRIGHTS',
  'MOVIES', 'CINEMA', 'FILM', 'THE OSCARS', 'ACTORS & ACTRESSES',
  'MUSIC', 'POP MUSIC', 'CLASSICAL MUSIC', 'COMPOSERS', 'MUSICAL INSTRUMENTS',
  'ART', 'ART & ARTISTS', 'PAINTING', 'SCULPTURE', 'MUSEUMS',
  'MYTHOLOGY', 'ANCIENT MYTHOLOGY', 'GREEK MYTHOLOGY', 'ROMAN MYTHOLOGY', 'WORLD MYTHOLOGY',
  'FOOD & DRINK', 'FOOD', 'COOKING', 'CUISINE',
  'SPORTS', 'BASEBALL', 'OLYMPICS',
  'WORLD LEADERS', 'FAMOUS NAMES', 'U.S. PRESIDENTS', 'PRESIDENTS',
  'HOLIDAYS & OBSERVANCES', 'TELEVISION', 'TV', 'POP CULTURE', 'WORD ORIGINS', 'LANGUAGES',
  'FASHION', 'ARCHITECTURE', 'TRANSPORTATION', 'INVENTIONS'
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

function calculateGeneralElo(clueValue) {
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

      rawClues.push({
        round: cols[0],
        clueValue: cols[1],
        category: (cols[3] || '').trim(),
        rawClue: cols[5] || '',
        rawAnswer: cols[6] || '',
        airDate: cols[7] || '',
      });
    }
    return rawClues;
  } catch (err) {
    console.warn(`Failed season ${seasonNum}:`, err.message);
    return [];
  }
}

async function main() {
  console.log('=== Ingesting Additional 500 General Knowledge Questions ===');
  const candidateClues = [];
  const answerPoolSet = new Set();
  const seasons = [28, 29, 30, 31, 32, 33, 34, 35];

  for (const s of seasons) {
    process.stdout.write(`Fetching Season ${s}... `);
    const clues = await fetchSeasonClues(s);
    let matched = 0;

    for (const item of clues) {
      const catUpper = item.category.toUpperCase();
      const isGen = GENERAL_CATEGORIES.some((kw) => catUpper.includes(kw));
      if (isGen) {
        const clueText = cleanHtml(item.rawClue);
        const answerText = cleanAnswer(item.rawAnswer);

        if (
          !clueText || !answerText ||
          clueText.length < 25 || clueText.length > 280 ||
          answerText.length < 2 || answerText.length > 35 ||
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
    console.log(`Matched ${matched} clues (${candidateClues.length} total)`);
    if (candidateClues.length >= 1000) break;
  }

  const answerPool = Array.from(answerPoolSet);
  const seenClues = new Set();
  const targetQuestions = [];

  for (let i = 0; i < candidateClues.length && targetQuestions.length < 500; i++) {
    const cand = candidateClues[i];
    const key = cand.clueText.toLowerCase();
    if (seenClues.has(key)) continue;
    seenClues.add(key);

    const cAns = cand.answerText;
    const distractors = [];
    const poolShuffled = shuffle(answerPool);
    for (const d of poolShuffled) {
      if (d.toLowerCase() !== cAns.toLowerCase() && !distractors.includes(d)) {
        distractors.push(d);
        if (distractors.length === 3) break;
      }
    }
    if (distractors.length < 3) continue;

    const options = shuffle([cAns, ...distractors]);
    const id = `jarch-gen-s2-${cand.season}-${String(targetQuestions.length + 1).padStart(4, '0')}`;
    const cleanForWiki = cAns.replace(/^(the|a|an)\s+/i, '').trim();
    const wikiSlug = cleanForWiki.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('_');

    targetQuestions.push({
      id,
      category: 'general',
      clue_text: cand.clueText,
      answer: cAns,
      answer_mask_length: cAns.replace(/[^a-zA-Z0-9]/g, '').length,
      options,
      wikipedia_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(wikiSlug)}`,
      elo_rating: calculateGeneralElo(cand.clueValue),
      context_summary: `Jeopardy! category: "${cand.category}" • Aired: ${cand.airDate || 'Archive'}`,
      times_served: 0,
      times_correct: 0,
      is_flagged: false,
      updated_at: new Date().toISOString(),
    });
  }

  console.log(`Uploading ${targetQuestions.length} new general knowledge questions in batches...`);
  const BATCH = 100;
  for (let i = 0; i < targetQuestions.length; i += BATCH) {
    const batch = targetQuestions.slice(i, i + BATCH);
    const { error } = await supabase.from('questions').upsert(batch, { onConflict: 'id' });
    if (error) { console.error('Upload error:', error); process.exit(1); }
    console.log(`Uploaded ${i + batch.length} / ${targetQuestions.length}`);
  }

  const { count: genCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('category', 'general');
  const { count: totalCount } = await supabase.from('questions').select('id', { count: 'exact', head: true });
  console.log('=== Finished General Knowledge Expansion ===');
  console.log(`General questions now: ${genCount}`);
  console.log(`Total questions in database: ${totalCount}`);
}

main().catch(err => { console.error(err); process.exit(1); });
