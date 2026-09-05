import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark, Category, Question, QuestionReport, ReportReason, UserProfile } from '../types';
import { INITIAL_QUESTIONS } from './questions';
import { BUNDLED_JARCHIVE_CLUES, TriviaApiClient } from '../services/api/triviaApiClient';

const STORAGE_KEYS = {
  PROFILE: '@pochipochi_user_profile_v1',
  QUESTIONS: '@pochipochi_questions_v1',
  BOOKMARKS: '@pochipochi_bookmarks_v1',
  REPORTS: '@pochipochi_reports_v1',
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
};

export class PochiRepository {
  private static questionsCache: Question[] | null = null;
  private static profileCache: UserProfile | null = null;
  private static bookmarksCache: Bookmark[] | null = null;

  static async getProfile(): Promise<UserProfile> {
    if (this.profileCache) return this.profileCache;
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        this.profileCache = JSON.parse(data);
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

    // Ensure bundled J! Archive clues are integrated
    const existingIds = new Set(questions.map((q) => q.id));
    let hasNewClues = false;
    BUNDLED_JARCHIVE_CLUES.forEach((clue, idx) => {
      const converted = TriviaApiClient.convertJArchiveToQuestion(clue, idx);
      if (!existingIds.has(converted.id)) {
        questions.push(converted);
        existingIds.add(converted.id);
        hasNewClues = true;
      }
    });

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
    const questions = await this.getQuestions();
    const index = questions.findIndex((q) => q.id === updated.id);
    if (index >= 0) {
      questions[index] = updated;
      await this.saveQuestions(questions);
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
      }
    }

    if (added > 0) {
      await this.saveQuestions(currentQuestions);
    }

    return { added, total: currentQuestions.length };
  }

  /**
   * Retrieves an adaptive question close to the player's Elo rating
   */
  static async getNextQuestion(
    categoryFilter: Category | 'all',
    excludeIds: string[] = []
  ): Promise<Question> {
    const questions = await this.getQuestions();
    const profile = await this.getProfile();

    let candidatePool = questions.filter((q) => !excludeIds.includes(q.id));
    if (categoryFilter !== 'all') {
      candidatePool = candidatePool.filter((q) => q.category === categoryFilter);
    }

    // If candidate pool is running low, proactively prefetch from J! Archive / TriviaQA API
    if (candidatePool.length <= 2) {
      this.syncExternalQuestions(categoryFilter, 5).catch(() => {});
    }

    if (candidatePool.length === 0) {
      // If all questions exhausted, reset exclusion
      candidatePool =
        categoryFilter === 'all'
          ? questions
          : questions.filter((q) => q.category === categoryFilter);
    }

    const targetElo =
      categoryFilter === 'all'
        ? profile.overall_elo
        : profile.category_elos[categoryFilter] ?? profile.overall_elo;

    // Sort by smallest Elo difference to match player skill level
    candidatePool.sort(
      (a, b) => Math.abs(a.elo_rating - targetElo) - Math.abs(b.elo_rating - targetElo)
    );

    // Pick among the top 3 closest matches randomly for organic variety
    const topChoices = candidatePool.slice(0, Math.min(3, candidatePool.length));
    const selected = topChoices[Math.floor(Math.random() * topChoices.length)];

    return selected || questions[0];
  }

  static async getBookmarks(): Promise<Bookmark[]> {
    if (this.bookmarksCache) return this.bookmarksCache;
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) {
        this.bookmarksCache = JSON.parse(data);
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
    const existingIndex = bookmarks.findIndex((b) => b.question_id === question.id);
    let isSaved = false;

    if (existingIndex >= 0) {
      bookmarks.splice(existingIndex, 1);
      isSaved = false;
    } else {
      bookmarks.unshift({
        question_id: question.id,
        saved_at: new Date().toISOString(),
        question,
      });
      isSaved = true;
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

      // Mark question as flagged
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
}
