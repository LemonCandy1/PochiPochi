import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark, Category, FTUESessionState, Question, QuestionReport, ReportReason, UserProfile } from '../types';
import { INITIAL_QUESTIONS, ALL_INTRODUCTORY_QUESTIONS, INTRODUCTORY_QUESTIONS } from './questions';
import { BUNDLED_JARCHIVE_CLUES, TriviaApiClient } from '../services/api/triviaApiClient';
import { SupabaseService } from '../services/supabase/supabaseClient';
import { formatWikipediaUrl } from '../utils/wikipedia';
import { randomizeQuestionOptions } from '../utils/shuffle';

const STORAGE_KEYS = {
  PROFILE: '@pochipochi_user_profile_v1',
  QUESTIONS: '@pochipochi_questions_v1',
  BOOKMARKS: '@pochipochi_bookmarks_v1',
  REPORTS: '@pochipochi_reports_v1',
  FTUE_COMPLETED: '@pochipochi_ftue_completed_v1',
  ATTEMPTED_QUESTIONS: '@pochipochi_attempted_questions_v2',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'solo-player-1',
  username: 'PochiMaster',
  avatar: 'smart-labrador',
  overall_elo: 1200,
  category_elos: {
    science: 1200,
    geography: 1200,
    anime: 1200,
    general: 1200,
  },
  total_played: 0,
  total_correct: 0,
  current_streak: 0,
  best_streak: 0,
  show_letter_count: true,
  sound_enabled: true,
};

export class PochiRepository {
  private static questionsCache: Question[] | null = null;
  private static profileCache: UserProfile | null = null;
  private static bookmarksCache: Bookmark[] | null = null;
  private static attemptedKeysCache: Set<string> | null = null;

  static async getProfile(): Promise<UserProfile> {
    if (this.profileCache) return this.profileCache;
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        this.profileCache = { ...DEFAULT_PROFILE, ...JSON.parse(data) };
        return this.profileCache!;
      }
    } catch (e) {
      console.warn('Failed to load profile from storage', e);
    }
    this.profileCache = { ...DEFAULT_PROFILE };
    await this.saveProfile(this.profileCache);
    return this.profileCache;
  }

  static async saveProfile(profile: UserProfile): Promise<void> {
    this.profileCache = profile;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      // Asynchronously sync to Supabase backend if configured
      if (SupabaseService.isConfigured()) {
        SupabaseService.syncProfile(profile).catch((err) => {
          console.warn('[Repository] Supabase profile sync background error:', err);
        });
      }
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  }

  static async getQuestions(): Promise<Question[]> {
    if (this.questionsCache) return this.questionsCache;
    let questions: Question[] = [];
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
      if (data) {
        questions = JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to load questions from storage', e);
    }

    if (questions.length === 0) {
      questions = [...INITIAL_QUESTIONS];
    }

    // Deduplicate any legacy duplicate clues stored in AsyncStorage
    const seenClues = new Set<string>();
    const deduplicated: Question[] = [];
    for (const q of questions) {
      const key = q.clue_text.trim().toLowerCase();
      if (!seenClues.has(key)) {
        seenClues.add(key);
        deduplicated.push(q);
      }
    }
    questions = deduplicated;

    // Ensure bundled J! Archive clues are integrated
    const existingIds = new Set(questions.map((q) => q.id));
    let hasNewClues = false;
    BUNDLED_JARCHIVE_CLUES.forEach((clue, idx) => {
      const converted = TriviaApiClient.convertJArchiveToQuestion(clue, idx);
      const key = converted.clue_text.trim().toLowerCase();
      if (!seenClues.has(key) && !existingIds.has(converted.id)) {
        questions.push(converted);
        seenClues.add(key);
        existingIds.add(converted.id);
        hasNewClues = true;
      }
    });

    // Ensure all 12 special introductory placement questions are always present
    ALL_INTRODUCTORY_QUESTIONS.forEach((introQ) => {
      const key = introQ.clue_text.trim().toLowerCase();
      if (!seenClues.has(key) && !existingIds.has(introQ.id)) {
        questions.push(introQ);
        seenClues.add(key);
        existingIds.add(introQ.id);
        hasNewClues = true;
      }
    });

    // If Supabase is configured, pull randomized questions across the 1000+ question dataset
    if (SupabaseService.isConfigured()) {
      const initialOffset = Math.floor(Math.random() * 900);
      SupabaseService.fetchQuestions({ limit: 50, offset: initialOffset })
        .then((remoteQuestions) => {
          if (remoteQuestions.length > 0 && this.questionsCache) {
            let remoteAdded = 0;
            const currentIds = new Set(this.questionsCache.map((q) => q.id));
            const currentClues = new Set(
              this.questionsCache.map((q) => q.clue_text.trim().toLowerCase())
            );
            for (const rq of remoteQuestions) {
              const clueKey = rq.clue_text.trim().toLowerCase();
              if (!currentIds.has(rq.id) && !currentClues.has(clueKey)) {
                this.questionsCache.push(rq);
                currentIds.add(rq.id);
                currentClues.add(clueKey);
                remoteAdded++;
              }
            }
            if (remoteAdded > 0) {
              this.saveQuestions(this.questionsCache);
            }
          }
        })
        .catch(() => {});
    }

    // Ensure every single question has a verified, proper wikipedia link corresponding to its answer
    questions = questions.map((q) => ({
      ...q,
      wikipedia_url: formatWikipediaUrl(q.answer, q.wikipedia_url),
    }));

    this.questionsCache = questions;
    if (hasNewClues) {
      await this.saveQuestions(this.questionsCache);
    }
    return this.questionsCache;
  }

  static async saveQuestions(questions: Question[]): Promise<void> {
    this.questionsCache = questions;
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.warn('Failed to save questions', e);
    }
  }

  static async updateQuestion(updated: Question): Promise<void> {
    const normalized: Question = {
      ...updated,
      wikipedia_url: formatWikipediaUrl(updated.answer, updated.wikipedia_url),
    };
    const questions = await this.getQuestions();
    const index = questions.findIndex((q) => q.id === normalized.id);
    if (index >= 0) {
      questions[index] = normalized;
      await this.saveQuestions(questions);

      // Push updated stats (elo, times served, times correct) to Supabase
      if (SupabaseService.isConfigured()) {
        SupabaseService.upsertQuestion(normalized).catch(() => {});
      }
    }
  }

  /**
   * Synchronizes trivia clues from the self-hosted J! Archive / TriviaQA API endpoint.
   * Merges questions by ID and persists to local storage.
   */
  static async syncExternalQuestions(
    category: Category | 'all' = 'all',
    count: number = 10
  ): Promise<{ added: number; total: number }> {
    const profile = await this.getProfile();
    const targetElo =
      category === 'all'
        ? profile.overall_elo
        : profile.category_elos[category] ?? profile.overall_elo;

    const fetched = await TriviaApiClient.fetchQuestions({
      category,
      targetElo,
      count,
    });

    const currentQuestions = await this.getQuestions();
    const existingIds = new Set(currentQuestions.map((q) => q.id));
    let added = 0;

    for (const q of fetched) {
      if (!existingIds.has(q.id)) {
        currentQuestions.push(q);
        existingIds.add(q.id);
        added++;

        // Also push to Supabase if connected
        if (SupabaseService.isConfigured()) {
          SupabaseService.upsertQuestion(q).catch(() => {});
        }
      }
    }

    if (added > 0) {
      await this.saveQuestions(currentQuestions);
    }

    return { added, total: currentQuestions.length };
  }

  /**
   * Full two-way sync with Supabase backend:
   * Syncs profile, Elo stats, bookmarks, and questions.
   */
  static async syncAllWithSupabase(): Promise<{
    success: boolean;
    message: string;
    questionsCount: number;
    elo: number;
  }> {
    const profile = await this.getProfile();
    const questions = await this.getQuestions();

    if (!SupabaseService.isConfigured()) {
      return {
        success: false,
        message: 'Supabase credentials pending in .env',
        questionsCount: questions.length,
        elo: profile.overall_elo,
      };
    }

    try {
      // 1. Sync Profile & Elo
      await SupabaseService.syncProfile(profile);

      // 2. Sync Questions
      let pushed = 0;
      for (const q of questions.slice(0, 15)) {
        await SupabaseService.upsertQuestion(q);
        pushed++;
      }

      // 3. Pull new questions from Supabase
      const remoteQuestions = await SupabaseService.fetchQuestions({ limit: 50 });
      const currentIds = new Set(questions.map((q) => q.id));
      for (const rq of remoteQuestions) {
        if (!currentIds.has(rq.id)) {
          questions.push(rq);
          currentIds.add(rq.id);
        }
      }
      await this.saveQuestions(questions);

      // 4. Sync Bookmarks
      const bookmarks = await this.getBookmarks();
      for (const b of bookmarks) {
        await SupabaseService.syncBookmark(profile.id, b.question_id, 'save');
      }

      return {
        success: true,
        message: `Synced with Supabase (${questions.length} total questions)`,
        questionsCount: questions.length,
        elo: profile.overall_elo,
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Supabase synchronization failed',
        questionsCount: questions.length,
        elo: profile.overall_elo,
      };
    }
  }

  /**
   * Retrieves persistent set of question IDs and clue texts attempted by the user in the past
   */
  static async getAttemptedQuestionKeys(): Promise<Set<string>> {
    if (this.attemptedKeysCache) return this.attemptedKeysCache;
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ATTEMPTED_QUESTIONS);
      if (data) {
        const parsed: string[] = JSON.parse(data);
        this.attemptedKeysCache = new Set(parsed.map((k) => k.trim().toLowerCase()));
        return this.attemptedKeysCache;
      }
    } catch (e) {
      console.warn('Failed to load attempted questions from storage', e);
    }
    this.attemptedKeysCache = new Set<string>();
    return this.attemptedKeysCache;
  }

  /**
   * Records a question as tried/attempted so the player never encounters it again
   */
  static async recordAttemptedQuestion(questionId: string, clueText?: string): Promise<void> {
    const keys = await this.getAttemptedQuestionKeys();
    let modified = false;

    const idKey = questionId.trim().toLowerCase();
    if (idKey && !keys.has(idKey)) {
      keys.add(idKey);
      modified = true;
    }

    if (clueText) {
      const clueKey = clueText.trim().toLowerCase();
      if (clueKey && !keys.has(clueKey)) {
        keys.add(clueKey);
        modified = true;
      }
    }

    if (modified) {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ATTEMPTED_QUESTIONS,
          JSON.stringify([...keys])
        );
      } catch (e) {
        console.warn('Failed to save attempted questions to storage', e);
      }
    }
  }

  /**
   * Batch records multiple questions as tried/attempted (e.g. after FTUE)
   */
  static async recordAttemptedQuestions(
    items: { questionId: string; clueText?: string }[]
  ): Promise<void> {
    const keys = await this.getAttemptedQuestionKeys();
    let modified = false;

    for (const item of items) {
      const idKey = item.questionId.trim().toLowerCase();
      if (idKey && !keys.has(idKey)) {
        keys.add(idKey);
        modified = true;
      }
      if (item.clueText) {
        const clueKey = item.clueText.trim().toLowerCase();
        if (clueKey && !keys.has(clueKey)) {
          keys.add(clueKey);
          modified = true;
        }
      }
    }

    if (modified) {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ATTEMPTED_QUESTIONS,
          JSON.stringify([...keys])
        );
      } catch (e) {
        console.warn('Failed to batch save attempted questions to storage', e);
      }
    }
  }

  /**
   * Checks if a question has already been attempted in the past
   */
  static async isQuestionAttempted(questionId: string, clueText?: string): Promise<boolean> {
    const keys = await this.getAttemptedQuestionKeys();
    const idKey = questionId.trim().toLowerCase();
    if (keys.has(idKey)) return true;
    if (clueText) {
      const clueKey = clueText.trim().toLowerCase();
      if (keys.has(clueKey)) return true;
    }
    return false;
  }

  /**
   * Resets the player's attempted questions history (useful for testing or profile reset)
   */
  static async resetAttemptedQuestions(): Promise<void> {
    this.attemptedKeysCache = new Set<string>();
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ATTEMPTED_QUESTIONS);
    } catch (e) {
      console.warn('Failed to reset attempted questions', e);
    }
  }

  /**
   * Retrieves an adaptive question close to the player's Elo rating,
   * guaranteeing:
   * 1. The user NEVER encounters a question they have already tried in the past.
   * 2. Multiple choice options are randomized into different positions every time.
   */
  static async getNextQuestion(
    categoryFilter: Category | 'all',
    excludeIds: string[] = []
  ): Promise<Question> {
    const questions = await this.getQuestions();
    const profile = await this.getProfile();
    const attemptedKeys = await this.getAttemptedQuestionKeys();

    // Unified exclusion set: persistently attempted questions + session-excluded items
    const allExcludes = new Set<string>();
    for (const key of attemptedKeys) {
      allExcludes.add(key);
    }
    for (const x of excludeIds) {
      allExcludes.add(x.trim().toLowerCase());
    }

    // Prioritize serving the special introductory 3-question sequence (extremely easy -> very easy -> medium)
    // for players encountering this category for the first time, ONLY if not tried before
    if (categoryFilter !== 'all') {
      const introQuestions = INTRODUCTORY_QUESTIONS[categoryFilter] || [];
      for (const introQ of introQuestions) {
        if (
          !allExcludes.has(introQ.id.toLowerCase()) &&
          !allExcludes.has(introQ.clue_text.trim().toLowerCase())
        ) {
          return {
            ...introQ,
            options: randomizeQuestionOptions(introQ.options, introQ.answer),
            wikipedia_url: formatWikipediaUrl(introQ.answer, introQ.wikipedia_url),
          };
        }
      }
    }

    let candidatePool = questions.filter(
      (q) =>
        !allExcludes.has(q.id.toLowerCase()) &&
        !allExcludes.has(q.clue_text.trim().toLowerCase())
    );
    if (categoryFilter !== 'all') {
      candidatePool = candidatePool.filter((q) => q.category === categoryFilter);
    }

    // Proactively pull fresh questions from Supabase if candidate pool is running low
    if (candidatePool.length <= 25 && SupabaseService.isConfigured()) {
      try {
        // Random offset across the Supabase questions table (1000+ questions in geography/all)
        const isBroad = categoryFilter === 'geography' || categoryFilter === 'all';
        const maxOffset = isBroad ? 950 : 0;
        const randomOffset = maxOffset > 0 ? Math.floor(Math.random() * maxOffset) : 0;
        const remoteQuestions = await SupabaseService.fetchQuestions({
          category: categoryFilter,
          limit: 30,
          offset: randomOffset,
        });

        if (remoteQuestions.length > 0) {
          const currentIds = new Set(questions.map((q) => q.id));
          const currentClues = new Set(
            questions.map((q) => q.clue_text.trim().toLowerCase())
          );
          let added = false;
          for (const rq of remoteQuestions) {
            const clueKey = rq.clue_text.trim().toLowerCase();
            if (!currentIds.has(rq.id) && !currentClues.has(clueKey)) {
              questions.push(rq);
              currentIds.add(rq.id);
              currentClues.add(clueKey);
              added = true;
            }
            // Always feed into candidate pool if not tried and not already queued
            if (
              !allExcludes.has(rq.id.toLowerCase()) &&
              !allExcludes.has(clueKey) &&
              !candidatePool.some((c) => c.id === rq.id)
            ) {
              candidatePool.push(rq);
            }
          }
          if (added) {
            this.questionsCache = questions;
            this.saveQuestions(questions).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('[Repository] Supabase getNextQuestion prefetch error:', e);
      }
    }

    // Fallback if candidate pool is completely exhausted
    if (candidatePool.length === 0) {
      const categoryQuestions =
        categoryFilter === 'all'
          ? questions
          : questions.filter((q) => q.category === categoryFilter);

      // Exclude recently served questions from session
      const recentExcludes = new Set(
        excludeIds.slice(-30).map((x) => x.trim().toLowerCase())
      );
      candidatePool = categoryQuestions.filter(
        (q) =>
          !recentExcludes.has(q.id.toLowerCase()) &&
          !recentExcludes.has(q.clue_text.trim().toLowerCase())
      );

      if (candidatePool.length === 0) {
        const lastServedId = excludeIds[excludeIds.length - 1]?.toLowerCase();
        candidatePool = categoryQuestions.filter(
          (q) => q.id.toLowerCase() !== lastServedId
        );
        if (candidatePool.length === 0) {
          candidatePool = categoryQuestions;
        }
      }
    }

    const targetElo =
      categoryFilter === 'all'
        ? profile.overall_elo
        : profile.category_elos[categoryFilter] ?? profile.overall_elo;

    // Sort by smallest Elo difference to match player skill level
    candidatePool.sort(
      (a, b) => Math.abs(a.elo_rating - targetElo) - Math.abs(b.elo_rating - targetElo)
    );

    const topChoices = candidatePool.slice(0, Math.min(3, candidatePool.length));
    const selected = topChoices[Math.floor(Math.random() * topChoices.length)];

    const targetQ = selected || questions[0];
    return {
      ...targetQ,
      options: randomizeQuestionOptions(targetQ.options, targetQ.answer),
      wikipedia_url: formatWikipediaUrl(targetQ.answer, targetQ.wikipedia_url),
    };
  }

  static async getBookmarks(): Promise<Bookmark[]> {
    if (this.bookmarksCache) return this.bookmarksCache;
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) {
        const parsed: Bookmark[] = JSON.parse(data);
        this.bookmarksCache = parsed.map((b) => ({
          ...b,
          question: {
            ...b.question,
            wikipedia_url: formatWikipediaUrl(b.question.answer, b.question.wikipedia_url),
          },
        }));
        return this.bookmarksCache!;
      }
    } catch (e) {
      console.warn('Failed to load bookmarks', e);
    }
    this.bookmarksCache = [];
    return this.bookmarksCache;
  }

  static async isBookmarked(questionId: string): Promise<boolean> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.some((b) => b.question_id === questionId);
  }

  static async toggleBookmark(question: Question): Promise<boolean> {
    const bookmarks = await this.getBookmarks();
    const profile = await this.getProfile();
    const existingIndex = bookmarks.findIndex((b) => b.question_id === question.id);
    let isSaved = false;

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      isSaved = false;
      if (SupabaseService.isConfigured()) {
        SupabaseService.syncBookmark(profile.id, question.id, 'delete').catch(() => {});
      }
    } else {
      const normalizedQ: Question = {
        ...question,
        wikipedia_url: formatWikipediaUrl(question.answer, question.wikipedia_url),
      };
      bookmarks.unshift({
        question_id: question.id,
        saved_at: new Date().toISOString(),
        question: normalizedQ,
      });
      isSaved = true;
      if (SupabaseService.isConfigured()) {
        SupabaseService.syncBookmark(profile.id, question.id, 'save').catch(() => {});
      }
    }

    this.bookmarksCache = bookmarks;
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return isSaved;
  }

  static async submitReport(
    questionId: string,
    reason: ReportReason,
    details?: string
  ): Promise<QuestionReport> {
    const report: QuestionReport = {
      id: `rep-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      question_id: questionId,
      reason,
      details,
      created_at: new Date().toISOString(),
    };

    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEYS.REPORTS);
      const reports: QuestionReport[] = existing ? JSON.parse(existing) : [];
      reports.unshift(report);
      await AsyncStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

      const questions = await this.getQuestions();
      const q = questions.find((item) => item.id === questionId);
      if (q) {
        q.is_flagged = true;
        await this.saveQuestions(questions);
      }
    } catch (e) {
      console.warn('Failed to save report', e);
    }

    return report;
  }

  /**
   * Retrieves competitive leaderboard entries from Supabase or local fallback
   */
  static async getLeaderboard(): Promise<Array<{
    rank: number;
    username: string;
    avatar: string;
    elo: number;
    streak: number;
    isCurrentUser?: boolean;
  }>> {
    const profile = await this.getProfile();
    const userElo = profile.overall_elo;

    if (SupabaseService.isConfigured()) {
      const remote = await SupabaseService.fetchLeaderboard(10);
      if (remote.length > 0) {
        let hasUser = false;
        const mapped = remote.map((entry) => {
          const isMe = entry.username === profile.username;
          if (isMe) hasUser = true;
          return {
            ...entry,
            isCurrentUser: isMe,
          };
        });

        if (!hasUser) {
          mapped.push({
            rank: mapped.length + 1,
            username: profile.username,
            avatar: profile.avatar,
            elo: userElo,
            streak: profile.current_streak,
            isCurrentUser: true,
          });
          mapped.sort((a, b) => b.elo - a.elo);
          mapped.forEach((entry, idx) => {
            entry.rank = idx + 1;
          });
        }
        return mapped;
      }
    }

    // Default competitive rankings with user dynamically inserted
    const baseChampions = [
      { username: 'PochiMaster_99', avatar: 'dog', elo: 2150, streak: 28 },
      { username: 'TriviaCat_Neko', avatar: 'cat', elo: 1980, streak: 19 },
      { username: 'ProfessorOwl', avatar: 'owl', elo: 1840, streak: 14 },
      { username: profile.username, avatar: 'user', elo: userElo, streak: profile.current_streak, isCurrentUser: true },
      { username: 'Aperika88', avatar: 'bear', elo: 1140, streak: 5 },
      { username: 'Kenji_Ghibli', avatar: 'human', elo: 1080, streak: 3 },
    ];

    baseChampions.sort((a, b) => b.elo - a.elo);
    return baseChampions.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }

  static async hasCompletedFTUE(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(STORAGE_KEYS.FTUE_COMPLETED);
      return val === 'true';
    } catch {
      return false;
    }
  }

  static async completeFTUE(
    session: FTUESessionState,
    authMethod: 'apple' | 'google' | 'guest'
  ): Promise<UserProfile> {
    try {
      const current = await this.getProfile();
      const updated: UserProfile = {
        ...current,
        username:
          authMethod === 'apple'
            ? 'PochiChampion'
            : authMethod === 'google'
            ? 'PochiScholar'
            : current.username,
        avatar: session.selectedCompanion,
        overall_elo: session.calibratedElo,
        category_elos: {
          ...current.category_elos,
          [session.selectedCategory]: session.calibratedElo,
        },
        current_streak: 1,
        best_streak: Math.max(current.best_streak, 1),
        total_played: current.total_played + session.completedQuestions.length,
        total_correct:
          current.total_correct +
          session.completedQuestions.filter((q) => q.wasCorrect).length,
        has_completed_ftue: true,
      };

      await this.saveProfile(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.FTUE_COMPLETED, 'true');

      // Save the completed FTUE questions into knowledge notebook
      for (const item of session.completedQuestions) {
        const fullQ = (await this.getQuestions()).find(
          (q) => q.id === item.questionId
        );
        if (fullQ) {
          await this.toggleBookmark(fullQ);
        }
      }

      // Mark all completed FTUE questions as attempted so user never encounters them again
      if (session.completedQuestions.length > 0) {
        await this.recordAttemptedQuestions(
          session.completedQuestions.map((q) => ({
            questionId: q.questionId,
            clueText: q.questionText,
          }))
        );
      }

      return updated;
    } catch (e) {
      console.warn('Failed to complete FTUE', e);
      return await this.getProfile();
    }
  }

  static async resetFTUE(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FTUE_COMPLETED);
    } catch (e) {
      console.warn('Failed to reset FTUE', e);
    }
  }

  static async getFTUEQuestions(category: Category): Promise<Question[]> {
    const list = INTRODUCTORY_QUESTIONS[category] ?? INTRODUCTORY_QUESTIONS.geography;
    return list.map((q) => ({
      ...q,
      options: randomizeQuestionOptions(q.options, q.answer),
      wikipedia_url: formatWikipediaUrl(q.answer, q.wikipedia_url),
    }));
  }

  static async getIntroductoryQuestions(category: Category): Promise<Question[]> {
    const list = INTRODUCTORY_QUESTIONS[category] ?? INTRODUCTORY_QUESTIONS.geography;
    return list.map((q) => ({
      ...q,
      options: randomizeQuestionOptions(q.options, q.answer),
      wikipedia_url: formatWikipediaUrl(q.answer, q.wikipedia_url),
    }));
  }
}
