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
  ClientMessage,
  MatrixTile,
  Player,
  RoomState,
  ServerMessage,
  TriviaQuestion,
} from '../src/battle/types';

const PORT = Number(process.env.PORT || 4001);
const CHAR_STREAM_INTERVAL_MS = 65; // 1.3x faster reveal speed (was 85ms)
const BUZZ_JITTER_WINDOW_MS = 60;
const HUMAN_REACTION_THRESHOLD_MS = 120;
const ANSWER_TIMEOUT_MS = 18000;
const ROUND_INTRO_DURATION_MS = 3000;
const ROUND_RESOLVED_DURATION_MS = 4000;
const TARGET_WIN_SCORE = 100;
const MAX_ROUNDS = 10;

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
  public state: RoomState = 'LOBBY';
  public round = 0;
  public totalRounds = MAX_ROUNDS;
  public players = new Map<string, ConnectedClient>();

  // Question & Streaming
  public currentQuestionIndex = 0;
  public currentQuestion: TriviaQuestion | null = null;
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

  constructor(id: string) {
    this.id = id;
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
    const player: Player = {
      id: playerId,
      name: playerName,
      score: 0,
      isReady: false,
      rtt: 0,
      clockOffset: 0,
      isLockedOut: false,
    };
    this.players.set(playerId, { ws, player, roomId: this.id });
    this.syncRoomState();

    // If real human joined and bot exists, remove the bot
    if (playerId !== 'bot-pochi' && this.players.has('bot-pochi')) {
      this.players.delete('bot-pochi');
    }

    if (this.lobbyStartTimer) {
      clearTimeout(this.lobbyStartTimer);
      this.lobbyStartTimer = null;
    }

    // Auto-start if 2 or more players joined and room is idle
    if (this.players.size >= 2 && this.state === 'LOBBY') {
      this.lobbyStartTimer = setTimeout(() => {
        if (this.state === 'LOBBY') {
          this.startRoundIntro();
        }
      }, 1000);
    } else if (this.players.size === 1 && this.state === 'LOBBY') {
      // If solo player after 1.8s, spawn bot sparring partner so match begins
      this.lobbyStartTimer = setTimeout(() => {
        if (this.state === 'LOBBY' && this.players.size === 1) {
          this.addBotPlayer();
        }
      }, 1800);
    }
  }

  public addBotPlayer() {
    if (this.players.has('bot-pochi') || this.players.size >= 2) return;
    if (this.state !== 'LOBBY') return;

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
    this.players.delete(playerId);
    this.syncRoomState();

    const humanCount = Array.from(this.players.values()).filter(
      (c) => !c.player.id.startsWith('bot-')
    ).length;

    if (humanCount === 0) {
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

    // Select question
    const qIndex = (this.round - 1) % QUESTION_POOL.length;
    this.currentQuestion = QUESTION_POOL[qIndex];
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
      options: this.currentQuestion.options || [],
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

  constructor(port = PORT) {
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
    });
  }

  public getOrCreateRoom(roomId = 'quick-match'): BattleRoom {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = new BattleRoom(roomId);
      this.rooms.set(roomId, room);
    }
    return room;
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      let currentClient: ConnectedClient | null = null;

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
          if (msg.type === 'JOIN_ROOM') {
            const roomId = msg.roomId || 'quick-match';
            const playerId =
              (msg as any).reconnectPlayerId ||
              `p-${Math.random().toString(36).substring(2, 9)}`;
            const room = this.getOrCreateRoom(roomId);

            room.addPlayer(ws, playerId, msg.playerName || 'Player');
            currentClient = room.players.get(playerId) || null;
            if (currentClient) {
              this.clientMap.set(ws, currentClient);
            }

            // Immediately send JOIN_ACK so client knows their exact assigned playerId
            ws.send(
              JSON.stringify({
                type: 'JOIN_ACK',
                yourPlayerId: playerId,
                roomId,
                isHost: room.players.size === 1,
              })
            );
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
          const room = this.rooms.get(currentClient.roomId);
          if (room) {
            room.removePlayer(currentClient.player.id);
            if (room.players.size === 0) {
              this.rooms.delete(room.id);
            }
          }
          this.clientMap.delete(ws);
        }
      });
    });
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
