/**
 * server.ts
 * 
 * Pochi 1v1 Real-Time Authoritative Multiplayer Battle Server
 * Built with Node.js, TypeScript, and WebSocket (`ws`).
 * 
 * Features:
 * - Authoritative Room State Machine (LOBBY, ROUND_INTRO, STREAMING, BUZZ_ARBITRATION, ANSWERING, ROUND_RESOLVED, GAME_OVER)
 * - Two-Way NTP-style Clock Synchronization
 * - 60ms Sliding Jitter Window Buzz Arbitration
 * - 120ms Physical Reaction Anti-Cheat Validation
 * - Cascading Lockout & Reduced-Point Re-buzzing (+20 / -10 / +10 pts)
 * - Scrambled 4x4 Matrix Generation without leaking answers
 */

import http from 'http';
import WebSocket from 'ws';
const WSServer = (WebSocket as any).Server || (WebSocket as any).WebSocketServer || WebSocket;
import {
  cleanAnswerString,
  generateAnswerMatrix,
} from '../src/battle/matrixGenerator';
import {
  ROOM_CODE_ALPHABET,
  ROOM_CODE_LENGTH,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  normalizeRoomCode,
} from '../src/battle/roomCode';
import {
  ClientMessage,
  JoinErrorReason,
  MatrixTile,
  Player,
  RoomState,
  ServerMessage,
  TriviaQuestion,
} from '../src/battle/types';
import fs from 'fs';
import path from 'path';

// ── Supabase dynamic question pool ──────────────────────────────────────────
let DYNAMIC_QUESTION_POOL: TriviaQuestion[] = [];

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function loadQuestionsFromSupabase(): Promise<void> {
  try {
    // Read .env manually (no dotenv dependency needed)
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

    const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ndkimouioysvlunqpdnl.supabase.co';
    const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable_fqhrSxZFfiWRtDV_znrqoQ_vxiTqKum';

    // Fetch all questions from Supabase in pages of 1,000 to cover all categories
    let allRows: any[] = [];
    let offset = 0;
    const limit = 1000;
    while (true) {
      const url = `${SUPABASE_URL}/rest/v1/questions?select=id,clue_text,answer,options,category&limit=${limit}&offset=${offset}`;
      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.warn(`[Battle Server] Supabase fetch failed at offset ${offset} (${res.status}).`);
        break;
      }

      const rows: any[] = await res.json();
      if (!Array.isArray(rows) || rows.length === 0) break;
      allRows = allRows.concat(rows);
      if (rows.length < limit) break;
      offset += limit;
    }

    if (allRows.length === 0) {
      console.warn('[Battle Server] Supabase returned empty question set. Using fallback pool.');
      return;
    }

    DYNAMIC_QUESTION_POOL = shuffleArray(
      allRows
        .filter((r: any) => r.clue_text && r.answer)
        .map((r: any) => ({
          id: r.id,
          category: (r.category || 'TRIVIA').toUpperCase(),
          question: r.clue_text,
          answer: (r.answer as string).toUpperCase().replace(/[^A-Z0-9]/g, ''),
          options: Array.isArray(r.options)
            ? r.options.map((o: string) => o.toUpperCase().replace(/[^A-Z0-9 ]/g, '').trim())
            : [],
        }))
    );

    const catCounts: Record<string, number> = {};
    for (const q of DYNAMIC_QUESTION_POOL) {
      catCounts[q.category] = (catCounts[q.category] || 0) + 1;
    }
    console.log(`[Battle Server] Loaded ${DYNAMIC_QUESTION_POOL.length} questions from Supabase across categories:`, catCounts);
  } catch (err) {
    console.warn('[Battle Server] Could not load questions from Supabase:', (err as Error).message);
  }
}

const PORT = Number(process.env.PORT || 4001);
const CHAR_STREAM_INTERVAL_MS = 65; // 1.3x faster reveal speed (was 85ms)
const BUZZ_JITTER_WINDOW_MS = 60;
const HUMAN_REACTION_THRESHOLD_MS = 120;
const ANSWER_TIMEOUT_MS = 18000;
const ROUND_INTRO_DURATION_MS = 3000;
const ROUND_RESOLVED_DURATION_MS = 4000;
const TARGET_WIN_SCORE = 100;
const MAX_ROUNDS = 10;

// Rooms & matchmaking
const MAX_HUMANS_PER_ROOM = 2;
const QUICK_MATCH_BOT_DELAY_MS = 8000; // give a real opponent time to show up before PochiBot steps in
const EMPTY_ROOM_TTL_MS = 60000; // keep an empty room alive briefly so a dropped host can reconnect
const MAX_FAILED_JOINS_PER_SOCKET = 5;

export interface BattleServerOptions {
  quickMatchBotDelayMs?: number;
}

// Curated trivia pool with Jeopardy! / Battle-style progressive clues
const QUESTION_POOL: TriviaQuestion[] = [
  {
    id: 'q-1',
    category: 'SCIENCE & CHEMISTRY',
    question:
      'With atomic number 79, this transition metal was revered by ancient civilizations as the tears of the sun, never rusts or tarnishes, and has the chemical symbol Au.',
    answer: 'GOLD',
    options: ['GOLD', 'SILVER', 'COPPER', 'PLATINUM'],
  },
  {
    id: 'q-2',
    category: 'WORLD GEOGRAPHY',
    question:
      'Bordered by Jordan to the east and Israel to the west, this hypersaline lake situated at the lowest land elevation on Earth is commonly known as what water body?',
    answer: 'DEADSEA',
    options: ['DEADSEA', 'CASPIANSEA', 'LAKEBAIKAL', 'REDSEA'],
  },
  {
    id: 'q-3',
    category: 'MEDICINE & DISCOVERY',
    question:
      'Discovered in 1928 by Alexander Fleming from contaminated mold in a Petri dish, this miraculous substance became the world\'s first widely mass-produced antibiotic.',
    answer: 'PENICILLIN',
    options: ['PENICILLIN', 'ASPIRIN', 'INSULIN', 'STREPTOMYCIN'],
  },
  {
    id: 'q-4',
    category: 'ASTRONOMY',
    question:
      'Known as the Red Planet due to ubiquitous iron oxide on its terrain, this fourth planet from our Sun is home to the colossal shield volcano Olympus Mons.',
    answer: 'MARS',
    options: ['MARS', 'VENUS', 'JUPITER', 'MERCURY'],
  },
  {
    id: 'q-5',
    category: 'WORLD CAPITALS',
    question:
      'Originally named Edo prior to the Meiji Restoration in 1868, this ultra-populous metropolis on Tokyo Bay serves as the modern capital city of Japan.',
    answer: 'TOKYO',
    options: ['TOKYO', 'KYOTO', 'OSAKA', 'NAGOYA'],
  },
  {
    id: 'q-6',
    category: 'CELL BIOLOGY',
    question:
      'Often heralded as the powerhouse of eukaryotic cells, this vital double-membraned organelle generates the majority of biochemical cellular energy in the form of ATP.',
    answer: 'MITOCHONDRIA',
    options: ['MITOCHONDRIA', 'RIBOSOME', 'CHLOROPLAST', 'NUCLEUS'],
  },
  {
    id: 'q-7',
    category: 'HISTORY & CIVILIZATION',
    question:
      'Spanning over thirteen thousand miles across northern frontiers to ward off nomadic Eurasian raids, this architectural wonder was constructed across centuries in China.',
    answer: 'GREATWALL',
    options: ['GREATWALL', 'COLOSSEUM', 'FORBIDDENCITY', 'PETRA'],
  },
  {
    id: 'q-8',
    category: 'PHYSICS & MATHEMATICS',
    question:
      'Proclaimed by Isaac Newton in 1687, this fundamental force of universal attraction between physical masses is inversely proportional to the square of their distance.',
    answer: 'GRAVITY',
    options: ['GRAVITY', 'MAGNETISM', 'INERTIA', 'FRICTION'],
  },
  {
    id: 'q-9',
    category: 'WORLD LITERATURE',
    question:
      'Written by Herman Melville in 1851, this famous naval epic chronicles Captain Ahab\'s monomaniacal quest across stormy oceans for an elusive albino sperm whale.',
    answer: 'MOBYDICK',
    options: ['MOBYDICK', 'ODYSSEY', 'WARANDPEACE', 'DONQUIXOTE'],
  },
  {
    id: 'q-10',
    category: 'ELEMENTS & COSMOS',
    question:
      'Accounting for roughly seventy-five percent of all baryonic matter in the cosmos and bearing atomic number one, this is the most abundant element in our universe.',
    answer: 'HYDROGEN',
    options: ['HYDROGEN', 'HELIUM', 'OXYGEN', 'CARBON'],
  },
];

interface ConnectedClient {
  ws: WebSocket;
  player: Player;
  roomId: string;
}

interface IncomingBuzz {
  playerId: string;
  localTimestamp: number;
  adjustedTimestamp: number;
  receivedAt: number;
}

export class BattleRoom {
  public id: string;
  public isPrivate: boolean;
  public password: string;
  public botDelayMs: number;
  public emptyRoomTimer: ReturnType<typeof setTimeout> | null = null;
  // Everyone who has joined, so a dropped player can rejoin mid-game and keep their score
  public memberIds = new Set<string>();
  public departedScores = new Map<string, number>();
  public state: RoomState = 'LOBBY';
  public round = 0;
  public totalRounds = MAX_ROUNDS;
  public players = new Map<string, ConnectedClient>();

  // Question & Streaming
  public currentQuestionIndex = 0;
  public currentQuestion: TriviaQuestion | null = null;
  public usedQuestionIds = new Set<string>(); // prevents repeats within a game
  public currentTiles: MatrixTile[] = [];
  public streamedCharIndex = 0;
  public questionStartTime = 0;
  public streamInterval: ReturnType<typeof setTimeout> | null = null;

  // Buzz & Arbitration
  public buzzCollectionActive = false;
  public firstBuzzReceivedAt = 0;
  public collectedBuzzes: IncomingBuzz[] = [];
  public arbitrationTimer: ReturnType<typeof setTimeout> | null = null;
  public buzzQueue: string[] = []; // Ordered list of buzzers: [winner, runnerUp1, ...]
  public activeBuzzerId: string | null = null;
  public isCascadedAttempt = false;
  public wrongAttemptsThisQuestion = 0;

  // Answering
  public answerTimer: ReturnType<typeof setTimeout> | null = null;
  public activeAnsweringStartedAt = 0;

  // Single-instance state transition timers
  public lobbyStartTimer: ReturnType<typeof setTimeout> | null = null;
  public roundIntroTimer: ReturnType<typeof setTimeout> | null = null;
  public roundResolvedTimer: ReturnType<typeof setTimeout> | null = null;
  public streamEndGraceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    id: string,
    { isPrivate = false, password = '', botDelayMs = QUICK_MATCH_BOT_DELAY_MS } = {}
  ) {
    this.id = id;
    this.isPrivate = isPrivate;
    this.password = password;
    this.botDelayMs = botDelayMs;
  }

  public humanCount(): number {
    return Array.from(this.players.keys()).filter((id) => !id.startsWith('bot-')).length;
  }

  public broadcast(msg: ServerMessage) {
    const data = JSON.stringify(msg);
    for (const client of this.players.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  public getPlayerList(): Player[] {
    return Array.from(this.players.values()).map((c) => c.player);
  }

  public addPlayer(ws: WebSocket, playerId: string, playerName: string) {
    if (this.emptyRoomTimer) {
      clearTimeout(this.emptyRoomTimer);
      this.emptyRoomTimer = null;
    }

    const isRejoin = this.memberIds.has(playerId);
    this.memberIds.add(playerId);

    const player: Player = {
      id: playerId,
      name: playerName,
      score: this.departedScores.get(playerId) ?? 0,
      isReady: false,
      rtt: 0,
      clockOffset: 0,
      isLockedOut: false,
    };
    this.departedScores.delete(playerId);
    this.players.set(playerId, { ws, player, roomId: this.id });

    // If real human joined and bot exists, remove the bot
    if (playerId !== 'bot-pochi' && this.players.has('bot-pochi') && this.state === 'LOBBY') {
      this.players.delete('bot-pochi');
    }
    this.syncRoomState();

    // A rejoin mid-game slots straight back in without touching the game flow
    if (isRejoin && this.state !== 'LOBBY' && this.state !== 'GAME_OVER') return;

    if (this.lobbyStartTimer) {
      clearTimeout(this.lobbyStartTimer);
      this.lobbyStartTimer = null;
    }

    if (this.state === 'GAME_OVER') {
      this.state = 'LOBBY';
      this.round = 0;
      this.currentQuestion = null;
    }

    // Auto-start if 2 or more players joined and room is idle
    if (this.players.size >= 2 && this.state === 'LOBBY') {
      this.lobbyStartTimer = setTimeout(() => {
        if (this.state === 'LOBBY') {
          this.startRoundIntro();
        }
      }, 1000);
    } else if (this.players.size === 1 && this.state === 'LOBBY' && !this.isPrivate) {
      // Quick match only: if nobody shows up, spawn a bot sparring partner.
      // Private rooms always wait for the invited friend.
      this.lobbyStartTimer = setTimeout(() => {
        if (this.state === 'LOBBY' && this.players.size === 1) {
          this.addBotPlayer();
        }
      }, this.botDelayMs);
    }
  }

  public addBotPlayer() {
    if (this.players.has('bot-pochi') || this.players.size >= 2) return;
    if (this.state !== 'LOBBY' || this.isPrivate) return;

    const mockWs = {
      readyState: WebSocket.OPEN,
      send: () => {},
      on: () => {},
    } as any;
    const botPlayer: Player = {
      id: 'bot-pochi',
      name: 'PochiBot (AI)',
      score: 0,
      isReady: true,
      rtt: 20,
      clockOffset: 0,
      isLockedOut: false,
    };
    this.players.set('bot-pochi', { ws: mockWs, player: botPlayer, roomId: this.id });
    this.syncRoomState();

    if (this.state === 'LOBBY') {
      if (this.lobbyStartTimer) clearTimeout(this.lobbyStartTimer);
      this.lobbyStartTimer = setTimeout(() => {
        if (this.state === 'LOBBY') {
          this.startRoundIntro();
        }
      }, 1000);
    }
  }

  public removePlayer(playerId: string) {
    const leaving = this.players.get(playerId);
    if (leaving) this.departedScores.set(playerId, leaving.player.score);
    this.players.delete(playerId);
    this.syncRoomState();

    if (this.humanCount() === 0) {
      this.clearAllTimers();
      this.players.clear();
      this.state = 'LOBBY';
      this.round = 0;
      this.currentQuestion = null;
      this.syncRoomState();
    }
  }

  public syncRoomState() {
    this.broadcast({
      type: 'ROOM_STATE',
      state: this.state,
      players: this.getPlayerList(),
      round: this.round,
      totalRounds: this.totalRounds,
    });
  }

  public clearAllTimers() {
    if (this.streamInterval) clearInterval(this.streamInterval);
    if (this.arbitrationTimer) clearTimeout(this.arbitrationTimer);
    if (this.answerTimer) clearTimeout(this.answerTimer);
    if (this.lobbyStartTimer) clearTimeout(this.lobbyStartTimer);
    if (this.roundIntroTimer) clearTimeout(this.roundIntroTimer);
    if (this.roundResolvedTimer) clearTimeout(this.roundResolvedTimer);
    if (this.streamEndGraceTimer) clearTimeout(this.streamEndGraceTimer);
    if (this.emptyRoomTimer) clearTimeout(this.emptyRoomTimer);
    this.emptyRoomTimer = null;
    this.streamInterval = null;
    this.arbitrationTimer = null;
    this.answerTimer = null;
    this.lobbyStartTimer = null;
    this.roundIntroTimer = null;
    this.roundResolvedTimer = null;
    this.streamEndGraceTimer = null;
  }

  // ==========================================
  // STATE: ROUND_INTRO
  // ==========================================
  public startRoundIntro() {
    this.clearAllTimers();
    this.round += 1;
    this.state = 'ROUND_INTRO';
    this.wrongAttemptsThisQuestion = 0;
    this.buzzQueue = [];
    this.activeBuzzerId = null;
    this.isCascadedAttempt = false;

    // Reset lockouts for all players
    for (const client of this.players.values()) {
      client.player.isLockedOut = false;
    }

    // Select question — prefer dynamic Supabase pool, fall back to static pool
    const pool = DYNAMIC_QUESTION_POOL.length > 0 ? DYNAMIC_QUESTION_POOL : QUESTION_POOL;
    // Pick a random question not used yet in this game session (no repeats)
    let available = pool.filter((q) => !this.usedQuestionIds.has(q.id));
    if (available.length === 0) {
      this.usedQuestionIds.clear();
      available = pool;
    }
    const picked = available[Math.floor(Math.random() * available.length)];
    this.usedQuestionIds.add(picked.id);
    this.currentQuestion = picked;
    this.streamedCharIndex = 0;

    // Generate 4x4 matrix tiles (16 tiles) without exposing answer
    this.currentTiles = generateAnswerMatrix(this.currentQuestion.answer, 16);
    const cleanAns = cleanAnswerString(this.currentQuestion.answer);

    this.broadcast({
      type: 'ROUND_INTRO',
      round: this.round,
      totalRounds: this.totalRounds,
      category: this.currentQuestion.category,
      answerLength: cleanAns.length,
      tiles: this.currentTiles,
      options: shuffleArray(this.currentQuestion.options || []),
      cleanAnswer: cleanAns,
      durationMs: ROUND_INTRO_DURATION_MS,
    });

    this.roundIntroTimer = setTimeout(() => {
      if (this.state === 'ROUND_INTRO') {
        this.startStreaming();
      }
    }, ROUND_INTRO_DURATION_MS);
  }

  // ==========================================
  // STATE: STREAMING
  // ==========================================
  public startStreaming(fromCharIndex = 0) {
    if (!this.currentQuestion) return;
    this.clearAllTimers();
    this.state = 'STREAMING';
    this.streamedCharIndex = fromCharIndex;
    this.buzzCollectionActive = false;
    this.collectedBuzzes = [];
    this.questionStartTime = Date.now();

    this.syncRoomState();

    const fullText = this.currentQuestion.question;

    this.streamInterval = setInterval(() => {
      if (this.streamedCharIndex >= fullText.length) {
        // Stream completed without buzz
        this.clearAllTimers();
        this.broadcast({
          type: 'STREAM_PAUSED',
          charIndex: fullText.length,
          reason: 'END_OF_TEXT',
        });

        // 4-second grace window after full read (allow one more second to press the buzzer)
        this.streamEndGraceTimer = setTimeout(() => {
          if (this.state === 'STREAMING') {
            this.resolveRound();
          }
        }, 4000);
        return;
      }

      const nextChar = fullText[this.streamedCharIndex];
      this.streamedCharIndex += 1;

      this.broadcast({
        type: 'STREAM_CHAR',
        charIndex: this.streamedCharIndex,
        char: nextChar,
        totalChars: fullText.length,
      });
    }, CHAR_STREAM_INTERVAL_MS);
  }

  // ==========================================
  // STATE: BUZZ_ARBITRATION (60ms Sliding Jitter)
  // ==========================================
  public handleBuzz(playerId: string, localTimestamp: number, adjustedTimestamp: number) {
    const client = this.players.get(playerId);
    if (!client || client.player.isLockedOut) return;
    if (this.state !== 'STREAMING' && this.state !== 'BUZZ_ARBITRATION') return;

    const now = Date.now();
    const serverElapsed = now - this.questionStartTime;

    // Anti-Cheat: Physical Human Reaction Feasibility Check
    // Only penalize if streaming has not yet emitted any characters and packet arrived before start
    if (this.streamedCharIndex === 0 && serverElapsed < 40) {
      client.player.score = Math.max(0, client.player.score - 10);
      client.player.isLockedOut = true;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(
          JSON.stringify({
            type: 'ERROR_PENALTY',
            reason: 'MISFIRE_BEFORE_HUMAN_THRESHOLD',
            message: 'Misfire penalty! Buzz arrived before clue began streaming.',
            penaltyPoints: 10,
          } as ServerMessage)
        );
      }
      this.syncRoomState();
      return;
    }

    // First buzz triggers the 60ms sliding jitter window
    if (!this.buzzCollectionActive) {
      this.buzzCollectionActive = true;
      this.firstBuzzReceivedAt = now;
      this.collectedBuzzes = [];

      // Freeze clue streaming immediately
      if (this.streamInterval) {
        clearInterval(this.streamInterval);
        this.streamInterval = null;
      }
      if (this.streamEndGraceTimer) {
        clearTimeout(this.streamEndGraceTimer);
        this.streamEndGraceTimer = null;
      }

      this.state = 'BUZZ_ARBITRATION';
      this.broadcast({
        type: 'STREAM_PAUSED',
        charIndex: this.streamedCharIndex,
        reason: 'BUZZ',
      });

      // Schedule arbitration at the end of the 60ms window
      this.arbitrationTimer = setTimeout(() => {
        this.arbitrateBuzzers();
      }, BUZZ_JITTER_WINDOW_MS);
    }

    // Record incoming buzz in sliding window
    this.collectedBuzzes.push({
      playerId,
      localTimestamp,
      adjustedTimestamp,
      receivedAt: now,
    });
  }

  private arbitrateBuzzers() {
    this.buzzCollectionActive = false;
    this.state = 'ANSWERING';

    if (this.collectedBuzzes.length === 0) {
      // No valid buzzes (e.g. all penalized); resume streaming
      this.startStreaming(this.streamedCharIndex);
      return;
    }

    // Sort by NTP-normalized adjustedTimestamp ascending (true earliest reaction)
    this.collectedBuzzes.sort((a, b) => a.adjustedTimestamp - b.adjustedTimestamp);

    // Populate the buzz arbitration queue
    this.buzzQueue = this.collectedBuzzes.map((b) => b.playerId);
    this.activateNextBuzzer(false);
  }

  // ==========================================
  // STATE: ANSWERING
  // ==========================================
  private activateNextBuzzer(isCascaded: boolean) {
    if (this.buzzQueue.length === 0) {
      // Queue exhausted; resume streaming if text remains
      if (
        this.currentQuestion &&
        this.streamedCharIndex < this.currentQuestion.question.length
      ) {
        this.startStreaming(this.streamedCharIndex);
      } else {
        this.resolveRound();
      }
      return;
    }

    const winnerId = this.buzzQueue.shift()!;
    this.activeBuzzerId = winnerId;
    this.isCascadedAttempt = isCascaded;
    this.state = 'ANSWERING';
    this.activeAnsweringStartedAt = Date.now();

    const winnerClient = this.players.get(winnerId);
    const winnerName = winnerClient ? winnerClient.player.name : 'Unknown Player';

    const cleanAns = this.currentQuestion ? cleanAnswerString(this.currentQuestion.answer) : '';

    this.broadcast({
      type: 'BUZZ_ARBITRATED',
      winnerId,
      winnerName,
      cutoffCharIndex: this.streamedCharIndex,
      queueLength: this.buzzQueue.length,
      answerTimeoutMs: ANSWER_TIMEOUT_MS,
      cleanAnswer: cleanAns,
      isCascaded,
    });

    // 6-second timeout timer
    if (this.answerTimer) clearTimeout(this.answerTimer);
    this.answerTimer = setTimeout(() => {
      this.handleAnswerTimeout(winnerId);
    }, ANSWER_TIMEOUT_MS);
  }

  public handleKeystroke(playerId: string, input: string[]) {
    if (this.state !== 'ANSWERING' || this.activeBuzzerId !== playerId) return;

    // Relay keystrokes to opponents for real-time observation
    this.broadcast({
      type: 'KEYSTROKE_UPDATE',
      playerId,
      input,
    });
  }

  public handleAnswerSubmit(playerId: string, submittedAnswer: string) {
    if (this.state !== 'ANSWERING' || this.activeBuzzerId !== playerId) return;
    if (this.answerTimer) clearTimeout(this.answerTimer);

    if (!this.currentQuestion) return;

    const targetClean = cleanAnswerString(this.currentQuestion.answer);
    const playerClean = cleanAnswerString(submittedAnswer);
    const isCorrect = targetClean === playerClean;

    const client = this.players.get(playerId);
    if (!client) return;

    if (isCorrect) {
      // Points: +20 for 1st buzz, +10 for cascaded runner-up
      const points = this.isCascadedAttempt ? 10 : 20;
      client.player.score += points;

      this.broadcast({
        type: 'ANSWER_EVALUATED',
        playerId,
        isCorrect: true,
        pointsDelta: points,
        isLockedOut: false,
        cascadingToNext: false,
      });

      this.resolveRound();
    } else {
      // Incorrect: -10 pts penalty and lockout
      const penalty = -10;
      client.player.score = Math.max(0, client.player.score + penalty);
      client.player.isLockedOut = true;
      this.wrongAttemptsThisQuestion += 1;

      const shouldCascade =
        this.wrongAttemptsThisQuestion < 2 && this.buzzQueue.length > 0;

      this.broadcast({
        type: 'ANSWER_EVALUATED',
        playerId,
        isCorrect: false,
        pointsDelta: penalty,
        isLockedOut: true,
        cascadingToNext: shouldCascade,
      });

      if (this.wrongAttemptsThisQuestion >= 2) {
        // Max 2 wrong attempts reached -> discard question
        this.resolveRound();
      } else if (this.buzzQueue.length > 0) {
        // Cascade to next runner-up with +10 pt reward
        this.activateNextBuzzer(true);
      } else {
        // No one in queue -> resume reading clue
        this.activeBuzzerId = null;
        this.startStreaming(this.streamedCharIndex);
      }
    }
  }

  private handleAnswerTimeout(playerId: string) {
    if (this.state !== 'ANSWERING' || this.activeBuzzerId !== playerId) return;

    const client = this.players.get(playerId);
    if (client) {
      client.player.score = Math.max(0, client.player.score - 10);
      client.player.isLockedOut = true;
    }
    this.wrongAttemptsThisQuestion += 1;

    const shouldCascade =
      this.wrongAttemptsThisQuestion < 2 && this.buzzQueue.length > 0;

    this.broadcast({
      type: 'ANSWER_EVALUATED',
      playerId,
      isCorrect: false,
      pointsDelta: -10,
      isLockedOut: true,
      cascadingToNext: shouldCascade,
    });

    if (this.wrongAttemptsThisQuestion >= 2) {
      this.resolveRound();
    } else if (this.buzzQueue.length > 0) {
      this.activateNextBuzzer(true);
    } else {
      this.activeBuzzerId = null;
      this.startStreaming(this.streamedCharIndex);
    }
  }

  // ==========================================
  // STATE: ROUND_RESOLVED & GAME_OVER
  // ==========================================
  public resolveRound() {
    this.clearAllTimers();
    this.state = 'ROUND_RESOLVED';

    const fullQuestion = this.currentQuestion ? this.currentQuestion.question : '';
    const answer = this.currentQuestion ? this.currentQuestion.answer : '';

    this.broadcast({
      type: 'ROUND_RESOLVED',
      correctAnswer: answer,
      fullQuestionText: fullQuestion,
      players: this.getPlayerList(),
      durationMs: ROUND_RESOLVED_DURATION_MS,
    });

    this.roundResolvedTimer = setTimeout(() => {
      if (this.state === 'ROUND_RESOLVED') {
        this.checkGameCompletion();
      }
    }, ROUND_RESOLVED_DURATION_MS);
  }

  private checkGameCompletion() {
    const players = this.getPlayerList();
    const leader = [...players].sort((a, b) => b.score - a.score)[0];
    const reachedTarget = leader && leader.score >= TARGET_WIN_SCORE;
    const reachedMaxRounds = this.round >= this.totalRounds;

    if (reachedTarget || reachedMaxRounds) {
      this.state = 'GAME_OVER';
      this.broadcast({
        type: 'GAME_OVER',
        winner: leader || null,
        finalScoreboard: players,
      });
    } else {
      this.startRoundIntro();
    }
  }
}

export { BattleRoom as MinhayaRoom };

// ==========================================
// ROOM MANAGER & WEBSOCKET SERVER
// ==========================================
export class BattleServer {
  private server: http.Server;
  private wss: any;
  private rooms = new Map<string, BattleRoom>();
  private clientMap = new Map<WebSocket, ConnectedClient>();
  private quickMatchBotDelayMs: number;

  constructor(port = PORT, options: BattleServerOptions = {}) {
    this.quickMatchBotDelayMs = options.quickMatchBotDelayMs ?? QUICK_MATCH_BOT_DELAY_MS;
    this.server = http.createServer((req, res) => {
      const url = req.url || '/';

      if (url === '/healthz' || url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: Date.now(),
            activeRooms: this.rooms.size,
            connectedClients: this.clientMap.size,
          })
        );
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'ok',
          server: 'Pochi 1v1 Battle Arena Server',
          version: '1.0.0',
          activeRooms: this.rooms.size,
          connectedClients: this.clientMap.size,
        })
      );
    });

    this.wss = new WSServer({
      server: this.server,
      maxPayload: 16 * 1024, // 16KB payload safety limit against buffer overflow attacks
    });
    this.setupWebSocket();

    this.server.listen(port, () => {
      console.log(`[Battle Server] Listening on ws://localhost:${port} (health: /healthz)`);
      // Load questions from Supabase in background after server is up
      loadQuestionsFromSupabase().catch((err) => {
        console.warn('[Battle Server] Background question load failed:', err.message);
      });
    });
  }

  public getRoom(roomId: string): BattleRoom | undefined {
    return this.rooms.get(normalizeRoomCode(roomId));
  }

  private generateRoomCode(): string {
    let code = '';
    do {
      code = '';
      for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
        code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
      }
    } while (this.rooms.has(code));
    return code;
  }

  private createRoom(isPrivate: boolean, password = ''): BattleRoom {
    const room = new BattleRoom(this.generateRoomCode(), {
      isPrivate,
      password,
      botDelayMs: this.quickMatchBotDelayMs,
    });
    this.rooms.set(room.id, room);
    return room;
  }

  // Pair with the oldest public room that has exactly one human waiting
  private findQuickMatchRoom(): BattleRoom {
    for (const room of this.rooms.values()) {
      if (
        !room.isPrivate &&
        room.state === 'LOBBY' &&
        room.humanCount() === 1 &&
        !room.players.has('bot-pochi')
      ) {
        return room;
      }
    }
    return this.createRoom(false);
  }

  // Returns an error to send back, or null if the player may enter the room
  private validateJoin(
    room: BattleRoom | undefined,
    password: string | undefined,
    reconnectPlayerId: string | undefined
  ): { reason: JoinErrorReason; message: string } | null {
    if (!room) {
      return { reason: 'NOT_FOUND', message: "We couldn't find that room. Double-check the code." };
    }
    if (room.isPrivate && (password || '') !== room.password) {
      return { reason: 'BAD_PASSWORD', message: "That password doesn't match this room." };
    }
    const isRejoin = Boolean(reconnectPlayerId && room.memberIds.has(reconnectPlayerId));
    if (isRejoin) return null;
    if (room.humanCount() >= MAX_HUMANS_PER_ROOM) {
      return { reason: 'ROOM_FULL', message: 'This room already has two players.' };
    }
    if (room.state !== 'LOBBY' && room.state !== 'GAME_OVER') {
      return { reason: 'IN_PROGRESS', message: 'That battle has already started.' };
    }
    return null;
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      let currentClient: ConnectedClient | null = null;
      let failedJoins = 0;

      const sendJoinError = (reason: JoinErrorReason, message: string) => {
        ws.send(JSON.stringify({ type: 'JOIN_ERROR', reason, message } as ServerMessage));
      };

      const enterRoom = (room: BattleRoom, playerName: string, reconnectPlayerId?: string) => {
        // Leaving a previous room on the same socket (e.g. retrying a join)
        if (currentClient && currentClient.roomId !== room.id) {
          this.leaveRoom(currentClient, ws);
        }
        const playerId =
          reconnectPlayerId || `p-${Math.random().toString(36).substring(2, 9)}`;
        const name = (playerName || 'Player').trim().slice(0, 16) || 'Player';

        room.addPlayer(ws, playerId, name);
        currentClient = room.players.get(playerId) || null;
        if (currentClient) {
          this.clientMap.set(ws, currentClient);
        }

        // Immediately send JOIN_ACK so client knows their exact assigned playerId
        ws.send(
          JSON.stringify({
            type: 'JOIN_ACK',
            yourPlayerId: playerId,
            roomId: room.id,
            isHost: room.humanCount() === 1,
            isPrivate: room.isPrivate,
          } as ServerMessage)
        );
      };

      ws.on('message', (raw: Buffer) => {
        try {
          const msg = JSON.parse(raw.toString()) as ClientMessage;

          // 1. Low-Latency NTP Synchronization Ping/Pong
          if (msg.type === 'SYNC_PING') {
            const t2 = Date.now(); // server receive time
            const t3 = Date.now(); // server dispatch time
            const pong: ServerMessage = {
              type: 'SYNC_PONG',
              t1: msg.t1,
              t2,
              t3,
            };
            ws.send(JSON.stringify(pong));
            return;
          }

          // 2. Room Connection & Setup
          if (msg.type === 'CREATE_ROOM') {
            const password = String(msg.password || '').trim();
            if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
              sendJoinError(
                'BAD_PASSWORD',
                `Room passwords need ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters.`
              );
              return;
            }
            enterRoom(this.createRoom(true, password), msg.playerName, msg.reconnectPlayerId);
            return;
          }

          if (msg.type === 'QUICK_MATCH') {
            enterRoom(this.findQuickMatchRoom(), msg.playerName, msg.reconnectPlayerId);
            return;
          }

          if (msg.type === 'JOIN_ROOM') {
            // Legacy clients sent roomId 'quick-match' for public matchmaking
            if (!msg.roomId || msg.roomId === 'quick-match') {
              enterRoom(this.findQuickMatchRoom(), msg.playerName, msg.reconnectPlayerId);
              return;
            }
            if (failedJoins >= MAX_FAILED_JOINS_PER_SOCKET) {
              sendJoinError('TOO_MANY_ATTEMPTS', 'Too many wrong attempts. Try again in a bit.');
              ws.close();
              return;
            }
            const room = this.getRoom(msg.roomId);
            const error = this.validateJoin(room, msg.password, msg.reconnectPlayerId);
            if (error || !room) {
              failedJoins += 1;
              sendJoinError(error!.reason, error!.message);
              return;
            }
            enterRoom(room, msg.playerName, msg.reconnectPlayerId);
            return;
          }

          if (!currentClient) return;
          const room = this.rooms.get(currentClient.roomId);
          if (!room) return;

          // 3. Buzzer Event
          if (msg.type === 'BUZZ_REQUEST') {
            room.handleBuzz(
              currentClient.player.id,
              msg.localTimestamp,
              msg.adjustedTimestamp
            );
            return;
          }

          // 4. Live Keystroke Stream
          if (msg.type === 'KEYSTROKE') {
            room.handleKeystroke(currentClient.player.id, msg.input);
            return;
          }

          // 5. Answer Submit
          if (msg.type === 'SUBMIT_ANSWER') {
            room.handleAnswerSubmit(currentClient.player.id, msg.answer);
            return;
          }
        } catch (err) {
          console.error('[Battle Server] Error parsing packet:', err);
        }
      });

      ws.on('close', () => {
        if (currentClient) {
          this.leaveRoom(currentClient, ws);
          this.clientMap.delete(ws);
        }
      });
    });
  }

  private leaveRoom(client: ConnectedClient, ws: WebSocket) {
    const room = this.rooms.get(client.roomId);
    if (!room) return;
    // A stale socket closing after its player already reconnected must not evict them
    if (room.players.get(client.player.id)?.ws !== ws) return;

    room.removePlayer(client.player.id);
    if (room.humanCount() === 0) {
      room.players.clear();
      room.emptyRoomTimer = setTimeout(() => {
        if (room.humanCount() === 0) this.rooms.delete(room.id);
      }, EMPTY_ROOM_TTL_MS);
    }
  }

  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.close(() => {
        this.server.close(() => resolve());
      });
    });
  }
}

export { BattleServer as MinhayaServer };

// If invoked directly via CLI (e.g. `npx tsx server/server.ts`)
if (require.main === module) {
  const instance = new BattleServer(PORT);

  const shutdown = async (signal: string) => {
    console.log(`\n[Battle Server] Received ${signal}. Shutting down gracefully...`);
    try {
      await instance.close();
      console.log('[Battle Server] Server closed cleanly. Goodbye!');
      process.exit(0);
    } catch (err) {
      console.error('[Battle Server] Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
