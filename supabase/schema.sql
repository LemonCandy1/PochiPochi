-- ==========================================================
-- PochiPochi Database Schema (Supabase PostgreSQL)
-- Project: PochiPochi
-- Description: Schema for questions, player profiles, Elo ratings,
--              rankings, and saved bookmarks.
-- ==========================================================

-- 1. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('science', 'geography', 'anime', 'general')),
  clue_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  answer_mask_length INT DEFAULT 0,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  wikipedia_url TEXT,
  context_summary TEXT,
  elo_rating INT NOT NULL DEFAULT 1200,
  times_served INT NOT NULL DEFAULT 0,
  times_correct INT NOT NULL DEFAULT 0,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on category and Elo for rapid matchmaking
CREATE INDEX IF NOT EXISTS idx_questions_category_elo ON public.questions (category, elo_rating);

-- 2. PLAYER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL DEFAULT 'PochiMaster',
  avatar TEXT NOT NULL DEFAULT 'dog',
  overall_elo INT NOT NULL DEFAULT 1200,
  category_elos JSONB NOT NULL DEFAULT '{"science": 1200, "geography": 1200, "anime": 1200, "general": 1200}'::jsonb,
  total_played INT NOT NULL DEFAULT 0,
  total_correct INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  show_letter_count BOOLEAN NOT NULL DEFAULT TRUE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on overall_elo for fast leaderboard ordering
CREATE INDEX IF NOT EXISTS idx_profiles_overall_elo ON public.profiles (overall_elo DESC);

-- 3. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL REFERENCES public.questions (id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Index for retrieving user bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks (user_id);

-- 4. QUESTION REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  user_id TEXT,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ENABLE ROW LEVEL SECURITY (RLS) & PUBLIC READ ACCESS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies for gameplay
CREATE POLICY "Allow public read questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update questions" ON public.questions FOR ALL USING (true);

CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public update own profile" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow public bookmarks" ON public.bookmarks FOR ALL USING (true);
CREATE POLICY "Allow public reports" ON public.reports FOR ALL USING (true);

-- 6. SEED INITIAL QUESTIONS FROM J! ARCHIVE & CURATED POCHIPOCHI SET
INSERT INTO public.questions (id, category, clue_text, answer, answer_mask_length, options, wikipedia_url, context_summary, elo_rating)
VALUES
  (
    'j-101',
    'science',
    'With atomic number 1, it is the lightest and most abundant chemical element in the universe.',
    'Hydrogen',
    8,
    '["Hydrogen", "Helium", "Oxygen", "Carbon"]'::jsonb,
    'https://en.wikipedia.org/wiki/Hydrogen',
    'J! Archive clue from ELEMENTS & ATOMS (Jeopardy!, $200). Baseline Elo calibrated from historic Jeopardy tiers.',
    1000
  ),
  (
    'j-102',
    'science',
    'Known as the Red Planet due to iron oxide on its surface, it has the largest volcano in the Solar System, Olympus Mons.',
    'Mars',
    4,
    '["Mars", "Venus", "Mercury", "Jupiter"]'::jsonb,
    'https://en.wikipedia.org/wiki/Mars',
    'J! Archive clue from PLANETARY SCIENCE (Jeopardy!, $400). Baseline Elo calibrated from historic Jeopardy tiers.',
    1100
  ),
  (
    'j-103',
    'science',
    'Often called the powerhouse of the eukaryotic cell, this organelle generates most of the chemical energy via ATP.',
    'Mitochondria',
    12,
    '["Mitochondria", "Ribosome", "Golgi Apparatus", "Lysosome"]'::jsonb,
    'https://en.wikipedia.org/wiki/Mitochondrion',
    'J! Archive clue from CELL BIOLOGY (Jeopardy!, $600). Baseline Elo calibrated from historic Jeopardy tiers.',
    1200
  ),
  (
    'j-201',
    'geography',
    'Flowing north through northeastern Africa, this historic river has long been debated alongside the Amazon as the world’s longest.',
    'Nile River',
    9,
    '["Nile River", "Congo River", "Danube River", "Zambezi River"]'::jsonb,
    'https://en.wikipedia.org/wiki/Nile',
    'J! Archive clue from WORLD BODIES OF WATER (Jeopardy!, $200). Baseline Elo calibrated from historic Jeopardy tiers.',
    1000
  ),
  (
    'j-202',
    'geography',
    'At an altitude of over 2,800 meters in the Andes, this capital city of Ecuador is the closest capital to the Equator.',
    'Quito',
    5,
    '["Quito", "Bogotá", "Lima", "La Paz"]'::jsonb,
    'https://en.wikipedia.org/wiki/Quito',
    'J! Archive clue from WORLD CAPITALS (Jeopardy!, $400). Baseline Elo calibrated from historic Jeopardy tiers.',
    1100
  ),
  (
    'j-301',
    'anime',
    'Wearing an iconic straw hat, Monkey D. Luffy sets sail across the Grand Line to discover this legendary ultimate treasure.',
    'One Piece',
    8,
    '["One Piece", "Dragon Balls", "Death Note", "Philosopher Stone"]'::jsonb,
    'https://en.wikipedia.org/wiki/One_Piece',
    'J! Archive clue from ANIME HEROES (Jeopardy!, $200). Baseline Elo calibrated from historic Jeopardy tiers.',
    1000
  ),
  (
    'j-302',
    'anime',
    'This legendary Japanese co-founder of Studio Ghibli directed cinema masterpieces including Spirited Away and Princess Mononoke.',
    'Hayao Miyazaki',
    12,
    '["Hayao Miyazaki", "Isao Takahata", "Makoto Shinkai", "Satoshi Kon"]'::jsonb,
    'https://en.wikipedia.org/wiki/Hayao_Miyazaki',
    'J! Archive clue from ANIMATION MASTERS (Jeopardy!, $400). Baseline Elo calibrated from historic Jeopardy tiers.',
    1100
  ),
  (
    'j-401',
    'general',
    'Housed in the Louvre Museum in Paris, this 16th-century portrait by Leonardo da Vinci portrays Lisa Gherardini with an enigmatic smile.',
    'Mona Lisa',
    8,
    '["Mona Lisa", "The Last Supper", "The Birth of Venus", "Girl with a Pearl Earring"]'::jsonb,
    'https://en.wikipedia.org/wiki/Mona_Lisa',
    'J! Archive clue from ART MASTERPIECES (Jeopardy!, $200). Baseline Elo calibrated from historic Jeopardy tiers.',
    1000
  )
ON CONFLICT (id) DO NOTHING;

-- 7. SEED INITIAL LEADERBOARD CHAMPIONS
INSERT INTO public.profiles (id, username, avatar, overall_elo, current_streak, best_streak)
VALUES
  ('champ-1', 'PochiMaster_99', 'dog', 2150, 28, 35),
  ('champ-2', 'TriviaCat_Neko', 'cat', 1980, 19, 24),
  ('champ-3', 'ProfessorOwl', 'owl', 1840, 14, 18),
  ('champ-4', 'Aperika88', 'bear', 1140, 5, 12),
  ('champ-5', 'Kenji_Ghibli', 'human', 1080, 3, 9)
ON CONFLICT (id) DO NOTHING;
