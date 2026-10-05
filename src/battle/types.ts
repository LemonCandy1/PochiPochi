/**
 * Battle Types
 * 
 * Shared type definitions for Pochi 1v1 Real-Time Multiplayer Battle Arena.
 */

export type RoomState =
  | 'LOBBY'
  | 'ROUND_INTRO'
  | 'STREAMING'
  | 'BUZZ_ARBITRATION'
  | 'ANSWERING'
  | 'ROUND_RESOLVED'
  | 'GAME_OVER';

export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  rtt: number;
  clockOffset: number;
  isLockedOut: boolean;
}

export interface TriviaQuestion {
  id: string;
  category: string;
  question: string;
  answer: string; // Server-side only until ROUND_RESOLVED
  options?: string[]; // 4 multiple choice options
}

export interface MatrixTile {
  id: string;
  letter: string;
  isUsed?: boolean;
}

export type JoinErrorReason =
  | 'NOT_FOUND'
  | 'BAD_PASSWORD'
  | 'ROOM_FULL'
  | 'IN_PROGRESS'
  | 'TOO_MANY_ATTEMPTS';

// Client -> Server Messages
export type ClientMessage =
  | { type: 'SYNC_PING'; t1: number }
  // Host a private room; the server assigns the room code.
  | { type: 'CREATE_ROOM'; playerName: string; password: string; reconnectPlayerId?: string }
  // Join a private room by code + password (also used to rejoin after a dropped connection).
  | {
      type: 'JOIN_ROOM';
      roomId: string;
      playerName: string;
      password?: string;
      reconnectPlayerId?: string;
    }
  // Get paired with any open player; PochiBot steps in if nobody shows up.
  | { type: 'QUICK_MATCH'; playerName: string; reconnectPlayerId?: string }
  | { type: 'PLAYER_READY' }
  | {
      type: 'BUZZ_REQUEST';
      localTimestamp: number;
      adjustedTimestamp: number;
    }
  | { type: 'KEYSTROKE'; input: string[] }
  | { type: 'SUBMIT_ANSWER'; answer: string };

// Server -> Client Messages
export type ServerMessage =
  | {
      type: 'JOIN_ACK';
      yourPlayerId: string;
      roomId: string;
      isHost: boolean;
      isPrivate: boolean;
    }
  | { type: 'JOIN_ERROR'; reason: JoinErrorReason; message: string }
  | { type: 'SYNC_PONG'; t1: number; t2: number; t3: number }
  | {
      type: 'ROOM_STATE';
      state: RoomState;
      players: Player[];
      round: number;
      totalRounds: number;
    }
  | {
      type: 'ROUND_INTRO';
      round: number;
      totalRounds: number;
      category: string;
      answerLength: number;
      tiles: MatrixTile[];
      options?: string[];
      cleanAnswer?: string;
      durationMs: number;
    }
  | {
      type: 'STREAM_CHAR';
      charIndex: number;
      char: string;
      totalChars: number;
    }
  | {
      type: 'STREAM_PAUSED';
      charIndex: number;
      reason: 'BUZZ' | 'END_OF_TEXT';
    }
  | {
      type: 'BUZZ_ARBITRATED';
      winnerId: string;
      winnerName: string;
      cutoffCharIndex: number;
      queueLength: number;
      answerTimeoutMs: number;
      cleanAnswer?: string;
      isCascaded?: boolean;
    }
  | {
      type: 'KEYSTROKE_UPDATE';
      playerId: string;
      input: string[];
    }
  | {
      type: 'ANSWER_EVALUATED';
      playerId: string;
      isCorrect: boolean;
      pointsDelta: number;
      isLockedOut: boolean;
      cascadingToNext: boolean;
    }
  | {
      type: 'ROUND_RESOLVED';
      correctAnswer: string;
      fullQuestionText: string;
      players: Player[];
      durationMs: number;
    }
  | {
      type: 'GAME_OVER';
      winner: Player | null;
      finalScoreboard: Player[];
    }
  | {
      type: 'ERROR_PENALTY';
      reason: 'MISFIRE_BEFORE_HUMAN_THRESHOLD' | 'TIMEOUT' | 'WRONG_ANSWER';
      message: string;
      penaltyPoints: number;
    };
