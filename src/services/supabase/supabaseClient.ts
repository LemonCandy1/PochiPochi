import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Bookmark, Category, Question, UserProfile } from '../../types';

/**
 * Supabase Client Configuration for PochiPochi Database
 * 
 * Configured via:
 * - EXPO_PUBLIC_SUPABASE_URL (e.g., https://xyzcompany.supabase.co)
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY (public anon key from Supabase Dashboard)
 */

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://pochipochi-database.supabase.co'; // Fallback / placeholder

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'public-anon-key-placeholder';

let supabaseInstance: SupabaseClient | null = null;

export class SupabaseService {
  /**
   * Checks if real Supabase credentials have been provided
   */
  public static isConfigured(): boolean {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    return Boolean(
      url &&
      key &&
      !url.includes('placeholder') &&
      !key.includes('placeholder') &&
      url.startsWith('http')
    );
  }

  /**
   * Returns or initializes the Supabase client singleton
   */
  public static getClient(): SupabaseClient {
    if (!supabaseInstance) {
      const url = process.env.EXPO_PUBLIC_SUPABASE_URL || SUPABASE_URL;
      const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
    return supabaseInstance;
  }

  /**
   * Tests connection to the Supabase backend
   */
  public static async testConnection(): Promise<{ ok: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        ok: false,
        message: 'Credentials pending in .env (EXPO_PUBLIC_SUPABASE_URL & ANON_KEY)',
      };
    }

    try {
      const client = this.getClient();
      const { count, error } = await client
        .from('questions')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return { ok: false, message: error.message };
      }
      return {
        ok: true,
        message: `Connected to Supabase PochiPochi (${count ?? 0} questions)`,
      };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'Network timeout connecting to Supabase' };
    }
  }

  /**
   * Fetches questions from Supabase backend
   */
  public static async fetchQuestions(params: {
    category?: Category | 'all';
    limit?: number;
  }): Promise<Question[]> {
    if (!this.isConfigured()) return [];

    try {
      const client = this.getClient();
      let query = client.from('questions').select('*');

      if (params.category && params.category !== 'all') {
        query = query.eq('category', params.category);
      }

      const { data, error } = await query.limit(params.limit || 20);

      if (error || !data) {
        console.warn('[Supabase] Failed to fetch questions:', error);
        return [];
      }

      return data.map((row: any) => ({
        id: row.id,
        category: row.category as Category,
        clue_text: row.clue_text,
        answer: row.answer,
        answer_mask_length: row.answer_mask_length || row.answer.replace(/\s+/g, '').length,
        options: Array.isArray(row.options) ? row.options : JSON.parse(row.options || '[]'),
        wikipedia_url: row.wikipedia_url,
        context_summary: row.context_summary,
        elo_rating: row.elo_rating ?? 1200,
        times_served: row.times_served ?? 0,
        times_correct: row.times_correct ?? 0,
      }));
    } catch (e) {
      console.warn('[Supabase] Exception fetching questions:', e);
      return [];
    }
  }

  /**
   * Upserts a question into the Supabase database
   */
  public static async upsertQuestion(question: Question): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const client = this.getClient();
      const { error } = await client.from('questions').upsert({
        id: question.id,
        category: question.category,
        clue_text: question.clue_text,
        answer: question.answer,
        answer_mask_length: question.answer_mask_length,
        options: question.options,
        wikipedia_url: question.wikipedia_url,
        context_summary: question.context_summary,
        elo_rating: question.elo_rating,
        times_served: question.times_served,
        times_correct: question.times_correct,
        updated_at: new Date().toISOString(),
      });

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Syncs player profile and Elo stats to Supabase profiles table
   */
  public static async syncProfile(profile: UserProfile): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const client = this.getClient();
      const { error } = await client.from('profiles').upsert({
        id: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        overall_elo: profile.overall_elo,
        category_elos: profile.category_elos,
        total_played: profile.total_played,
        total_correct: profile.total_correct,
        current_streak: profile.current_streak,
        best_streak: profile.best_streak,
        show_letter_count: profile.show_letter_count ?? true,
        updated_at: new Date().toISOString(),
      });

      return !error;
    } catch (e) {
      console.warn('[Supabase] Failed to sync profile:', e);
      return false;
    }
  }

  /**
   * Fetches the global player leaderboard ordered by overall_elo descending
   */
  public static async fetchLeaderboard(limit: number = 20): Promise<Array<{
    rank: number;
    username: string;
    avatar: string;
    elo: number;
    streak: number;
  }>> {
    if (!this.isConfigured()) return [];

    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('profiles')
        .select('username, avatar, overall_elo, current_streak')
        .order('overall_elo', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map((row: any, idx: number) => ({
        rank: idx + 1,
        username: row.username || `Player_${idx + 1}`,
        avatar: row.avatar || 'dog',
        elo: row.overall_elo ?? 1200,
        streak: row.current_streak ?? 0,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Saves or removes a bookmarked question in Supabase
   */
  public static async syncBookmark(
    userId: string,
    questionId: string,
    action: 'save' | 'delete'
  ): Promise<boolean> {
    if (!this.isConfigured()) return false;

    try {
      const client = this.getClient();
      if (action === 'save') {
        const { error } = await client.from('bookmarks').upsert({
          user_id: userId,
          question_id: questionId,
          saved_at: new Date().toISOString(),
        });
        return !error;
      } else {
        const { error } = await client
          .from('bookmarks')
          .delete()
          .match({ user_id: userId, question_id: questionId });
        return !error;
      }
    } catch {
      return false;
    }
  }

  /**
   * Fetches all bookmarked question IDs for a player from Supabase
   */
  public static async fetchBookmarkIds(userId: string): Promise<string[]> {
    if (!this.isConfigured()) return [];

    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('bookmarks')
        .select('question_id')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data.map((row: any) => row.question_id);
    } catch {
      return [];
    }
  }
}
