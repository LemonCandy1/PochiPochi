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

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const q = JSON.parse(fs.readFileSync(path.join(__dirname, 'anime_raw.json'), 'utf8'));

function buildRecord(idx, raw) {
  const [question, correct, w1, w2, w3, series, elo] = raw;
  const options = shuffle([correct, w1, w2, w3]);
  const answerMaskLength = correct.replace(/[^a-zA-Z0-9]/g, '').length;
  const wikiSlug = correct.split(/[\s,.(]/)[0].replace(/[^a-zA-Z0-9]/g, '_');
  return {
    id: 'anime-hc-' + String(idx + 1).padStart(4, '0'),
    category: 'anime',
    clue_text: question,
    answer: correct,
    answer_mask_length: answerMaskLength,
    options,
    wikipedia_url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(wikiSlug),
    elo_rating: elo,
    context_summary: 'Series: ' + series,
    times_served: 0,
    times_correct: 0,
    is_flagged: false,
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  console.log('=== PochiPochi: Anime Seed (Offline) ===');
  const { count: before } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('category','anime');
  console.log('Existing anime questions:', before);

  const { data: existing } = await supabase.from('questions').select('id').eq('category','anime');
  const existingIds = new Set((existing||[]).map(r=>r.id));

  const records = q.map((r,i) => buildRecord(i,r)).filter(r => !existingIds.has(r.id));
  console.log('New questions to insert:', records.length);
  if (!records.length) { console.log('Nothing to insert.'); return; }

  const BATCH = 50;
  let done = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i+BATCH);
    const { error } = await supabase.from('questions').upsert(batch, { onConflict: 'id' });
    if (error) { console.error('Batch error:', error); process.exit(1); }
    done += batch.length;
    console.log('Uploaded', done, '/', records.length);
  }

  const { count: after } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('category','anime');
  const { count: total } = await supabase.from('questions').select('id', { count: 'exact', head: true });
  console.log('=== Done ===');
  console.log('Anime questions:', after);
  console.log('Total questions:', total);
}

main().catch(e => { console.error(e); process.exit(1); });
