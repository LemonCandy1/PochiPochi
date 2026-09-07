export type Category = 'science' | 'geography' | 'anime' | 'general';

export interface CategoryInfo {
  id: Category;
  label: string;
  themeTag: string;
  iconName: string;
  description: string;
}

export type DifficultyTier = 'extremely_easy' | 'very_easy' | 'medium';
export type SpecialCategory = 'introductory' | 'standard';

export interface Question {
  id: string;
  category: Category;
  clue_text: string;
  answer: string;
  answer_mask_length: number;
  options: string[];
  wikipedia_url: string;
  context_summary: string;
  elo_rating: number;
  times_served: number;
  times_correct: number;
  is_flagged?: boolean;
  difficulty_tier?: DifficultyTier;
  is_ftue_placement?: boolean;
  is_introductory?: boolean;
  special_category?: SpecialCategory;
}

export type CompanionType = 'dog' | 'bear' | 'bunny' | 'owl';

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  overall_elo: number;
  category_elos: Record<Category, number>;
  total_played: number;
  total_correct: number;
  current_streak: number;
  best_streak: number;
  show_letter_count?: boolean;
  sound_enabled?: boolean;
  has_completed_ftue?: boolean;
}

export interface FTUESessionState {
  guestId: string;
  selectedCompanion: CompanionType;
  selectedCategory: Category;
  calibratedElo: number;
  sessionStreak: number;
  completedQuestions: {
    questionId: string;
    questionText: string;
    answer: string;
    wasCorrect: boolean;
    interruptSpeedMs: number;
    wikiUrl: string;
    contextSummary: string;
    difficultyTier?: DifficultyTier;
  }[];
}

export interface EloChangeResult {
  playerEloBefore: number;
  playerEloAfter: number;
  deltaPlayer: number;
  questionEloBefore: number;
  questionEloAfter: number;
  deltaQuestion: number;
  speedMultiplier: number;
}

export interface Bookmark {
  question_id: string;
  saved_at: string;
  question: Question;
}

export type ReportReason =
  | 'factual_inaccuracy'
  | 'typo_grammar'
  | 'mask_count_error'
  | 'inappropriate_offensive';

export interface QuestionReport {
  id: string;
  question_id: string;
  reason: ReportReason;
  details?: string;
  created_at: string;
}
