/**
 * useBattleClient.ts
 * 
 * React hook managing 1v1 Battle WebSocket connection, NTP clock synchronization,
 * room state transitions, audio haptics, and low-latency hardware buzzer dispatch.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  ClientMessage,
  MatrixTile,
  Player,
  RoomState,
  ServerMessage,
} from './types';
import { AudioHaptics } from '../utils/audioHaptics';

interface NTPSample {
  rtt: number;
  offset: number;
  t1: number;
  t4: number;
}

export type BattleJoinMode = 'quick' | 'create' | 'join';

export interface UseBattleClientOptions {
  serverUrl?: string;
  /** 'create' hosts a private room, 'join' enters one by code + password, 'quick' matchmakes. */
  mode?: BattleJoinMode;
  roomId?: string;
  password?: string;
  playerName?: string;
  autoConnect?: boolean;
}

export interface UseBattleClientReturn {
  connectionStatus: 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
  connect: () => void;
  disconnect: () => void;

  rtt: number;
  clockOffset: number;
  isNtpCalibrated: boolean;

  /** Server-assigned room code once joined */
  roomCode: string | null;
  isPrivateRoom: boolean;
  joinError: string | null;

  roomState: RoomState;
  players: Player[];
  myPlayer: Player | null;
  opponentPlayer: Player | null;
  round: number;
  totalRounds: number;
  category: string;

  streamedText: string;
  isStreamPaused: boolean;

  canBuzz: boolean;
  activeBuzzerId: string | null;
  activeBuzzerName: string | null;
  isMyTurnToAnswer: boolean;
  isLockedOut: boolean;
  setIsLockedOut: React.Dispatch<React.SetStateAction<boolean>>;
  answerLength: number;
  tiles: MatrixTile[];
  options: string[];
  cleanAnswer: string;
  opponentKeystrokes: string[];

  resolvedAnswer: string | null;
  resolvedFullQuestion: string | null;
  winner: Player | null;
  penaltyAlert: string | null;

  buzz: () => void;
  submitAnswer: (answer: string) => void;
  sendKeystroke: (slots: string[]) => void;
}

const NTP_WINDOW_SIZE = 8;
const DEFAULT_SERVER_URL = 'ws://localhost:4001';

export function useBattleClient({
  serverUrl = DEFAULT_SERVER_URL,
  mode = 'quick',
  roomId = '',
  password = '',
  playerName = 'PochiPlayer',
  autoConnect = true,
}: UseBattleClientOptions = {}): UseBattleClientReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const ntpIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ntpSamplesRef = useRef<NTPSample[]>([]);
  const isIntentionalDisconnectRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clockOffsetRef = useRef<number>(0);
  const [rtt, setRtt] = useState<number>(0);
  const [clockOffset, setClockOffset] = useState<number>(0);
  const [isNtpCalibrated, setIsNtpCalibrated] = useState<boolean>(false);

  const [connectionStatus, setConnectionStatus] = useState<
    'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'
  >('DISCONNECTED');
  // Once the server places us in a room, reconnects rejoin that exact room
  const assignedRoomIdRef = useRef<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isPrivateRoom, setIsPrivateRoom] = useState<boolean>(mode !== 'quick');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState>('LOBBY');
  const [players, setPlayers] = useState<Player[]>([]);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const myPlayerIdRef = useRef<string | null>(null);
  const [round, setRound] = useState<number>(0);
  const [totalRounds, setTotalRounds] = useState<number>(10);
  const [category, setCategory] = useState<string>('');

  const [streamedText, setStreamedText] = useState<string>('');
  const [isStreamPaused, setIsStreamPaused] = useState<boolean>(false);

  const [activeBuzzerId, setActiveBuzzerId] = useState<string | null>(null);
  const [activeBuzzerName, setActiveBuzzerName] = useState<string | null>(null);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [answerLength, setAnswerLength] = useState<number>(0);
  const [tiles, setTiles] = useState<MatrixTile[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [cleanAnswer, setCleanAnswer] = useState<string>('');
  const [opponentKeystrokes, setOpponentKeystrokes] = useState<string[]>([]);

  const [resolvedAnswer, setResolvedAnswer] = useState<string | null>(null);
  const [resolvedFullQuestion, setResolvedFullQuestion] = useState<string | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [penaltyAlert, setPenaltyAlert] = useState<string | null>(null);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendSyncPing = useCallback(() => {
    const t1 = Date.now();
    send({ type: 'SYNC_PING', t1 });
  }, [send]);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState <= WebSocket.OPEN) {
      return;
    }

    isIntentionalDisconnectRef.current = false;
    setConnectionStatus('CONNECTING');
    const ws = new WebSocket(serverUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('CONNECTED');
      reconnectAttemptsRef.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const reconnectPlayerId = myPlayerIdRef.current || undefined;
      let joinMsg: ClientMessage;
      if (assignedRoomIdRef.current) {
        joinMsg = {
          type: 'JOIN_ROOM',
          roomId: assignedRoomIdRef.current,
          password,
          playerName,
          reconnectPlayerId,
        };
      } else if (mode === 'create') {
        joinMsg = { type: 'CREATE_ROOM', playerName, password, reconnectPlayerId };
      } else if (mode === 'join') {
        joinMsg = { type: 'JOIN_ROOM', roomId, password, playerName, reconnectPlayerId };
      } else {
        joinMsg = { type: 'QUICK_MATCH', playerName, reconnectPlayerId };
      }
      ws.send(JSON.stringify(joinMsg));

      // Immediate NTP sync ping
      ws.send(JSON.stringify({ type: 'SYNC_PING', t1: Date.now() }));

      ntpSamplesRef.current = [];
      let burstCount = 0;
      if (burstIntervalRef.current) clearInterval(burstIntervalRef.current);
      burstIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          sendSyncPing();
          burstCount += 1;
          if (burstCount >= NTP_WINDOW_SIZE) {
            if (burstIntervalRef.current) {
              clearInterval(burstIntervalRef.current);
              burstIntervalRef.current = null;
            }
          }
        } else {
          if (burstIntervalRef.current) {
            clearInterval(burstIntervalRef.current);
            burstIntervalRef.current = null;
          }
        }
      }, 100);

      if (ntpIntervalRef.current) clearInterval(ntpIntervalRef.current);
      ntpIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          sendSyncPing();
        }
      }, 5000);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data) as ServerMessage;

        // 0. Join Ack
        if (msg.type === 'JOIN_ACK') {
          myPlayerIdRef.current = msg.yourPlayerId;
          setMyPlayerId(msg.yourPlayerId);
          assignedRoomIdRef.current = msg.roomId;
          setRoomCode(msg.roomId);
          setIsPrivateRoom(msg.isPrivate);
          setJoinError(null);
          return;
        }

        if (msg.type === 'JOIN_ERROR') {
          // Retrying won't fix a wrong code/password, so stop the reconnect loop
          isIntentionalDisconnectRef.current = true;
          setJoinError(msg.message);
          ws.close();
          return;
        }

        // 1. NTP Pong
        if (msg.type === 'SYNC_PONG') {
          const t4 = Date.now();
          const { t1, t2, t3 } = msg;

          const currentRtt = Math.max(0, (t4 - t1) - (t3 - t2));
          const currentOffset = ((t2 - t1) + (t3 - t4)) / 2;

          const samples = ntpSamplesRef.current;
          samples.push({ rtt: currentRtt, offset: currentOffset, t1, t4 });

          if (samples.length > NTP_WINDOW_SIZE) {
            samples.shift();
          }

          const bestSample = [...samples].sort((a, b) => a.rtt - b.rtt)[0];

          if (bestSample) {
            clockOffsetRef.current = bestSample.offset;
            setClockOffset(bestSample.offset);
            setRtt(bestSample.rtt);
            setIsNtpCalibrated(true);
          }
          return;
        }

        // 2. Room State
        if (msg.type === 'ROOM_STATE') {
          setRoomState(msg.state);
          setPlayers(msg.players);
          setRound(msg.round);
          setTotalRounds(msg.totalRounds);

          if (!myPlayerIdRef.current && msg.players.length > 0) {
            const me = msg.players.find((p) => p.name === playerName);
            if (me) {
              myPlayerIdRef.current = me.id;
              setMyPlayerId(me.id);
            }
          }
          return;
        }

        // 3. Round Intro
        if (msg.type === 'ROUND_INTRO') {
          setRoomState('ROUND_INTRO');
          setRound(msg.round);
          setTotalRounds(msg.totalRounds);
          setCategory(msg.category);
          setAnswerLength(msg.answerLength);
          setTiles(msg.tiles);
          setOptions(msg.options || []);
          setCleanAnswer(msg.cleanAnswer || '');
          setStreamedText('');
          setIsStreamPaused(false);
          setActiveBuzzerId(null);
          setActiveBuzzerName(null);
          setOpponentKeystrokes([]);
          setResolvedAnswer(null);
          setResolvedFullQuestion(null);
          setPenaltyAlert(null);
          setIsLockedOut(false);
          return;
        }

        // 4. Stream Char
        if (msg.type === 'STREAM_CHAR') {
          setRoomState('STREAMING');
          setIsStreamPaused(false);
          setStreamedText((prev) => prev + msg.char);
          if (msg.charIndex % 5 === 0) {
            AudioHaptics.playTypewriterTick();
          }
          return;
        }

        // 5. Stream Paused
        if (msg.type === 'STREAM_PAUSED') {
          if (msg.reason === 'BUZZ') {
            setIsStreamPaused(true);
          }
          // When reason is 'END_OF_TEXT', the clue text is completely revealed,
          // but buzzing remains active during the post-reveal grace window!
          return;
        }

        // 6. Buzz Arbitrated
        if (msg.type === 'BUZZ_ARBITRATED') {
          setRoomState('ANSWERING');
          setIsStreamPaused(true);
          setActiveBuzzerId(msg.winnerId);
          setActiveBuzzerName(msg.winnerName);
          if (msg.cleanAnswer) {
            setCleanAnswer(msg.cleanAnswer);
          }
          setOpponentKeystrokes([]);
          AudioHaptics.playPochiBuzzer();
          return;
        }

        // 7. Keystroke Update
        if (msg.type === 'KEYSTROKE_UPDATE') {
          setOpponentKeystrokes(msg.input);
          return;
        }

        // 8. Answer Evaluated
        if (msg.type === 'ANSWER_EVALUATED') {
          if (msg.isCorrect) {
            AudioHaptics.playCorrect();
          } else {
            AudioHaptics.playIncorrect();
            if (msg.playerId === myPlayerId || msg.playerId === myPlayerIdRef.current) {
              setIsLockedOut(true);
            }
          }
          return;
        }

        // 9. Round Resolved
        if (msg.type === 'ROUND_RESOLVED') {
          setRoomState('ROUND_RESOLVED');
          setResolvedAnswer(msg.correctAnswer);
          if (msg.correctAnswer) {
            setCleanAnswer(msg.correctAnswer.toUpperCase().replace(/[^A-Z0-9]/g, ''));
          }
          setResolvedFullQuestion(msg.fullQuestionText);
          setPlayers(msg.players);
          setActiveBuzzerId(null);
          setActiveBuzzerName(null);
          return;
        }

        // 10. Game Over
        if (msg.type === 'GAME_OVER') {
          setRoomState('GAME_OVER');
          setWinner(msg.winner);
          setPlayers(msg.finalScoreboard);
          return;
        }

        // 11. Penalty
        if (msg.type === 'ERROR_PENALTY') {
          setPenaltyAlert(`${msg.message} (-${msg.penaltyPoints} pts)`);
          setIsLockedOut(true);
          AudioHaptics.playIncorrect();
          setTimeout(() => setPenaltyAlert(null), 4000);
          return;
        }
      } catch (err) {
        console.error('[useBattleClient] Error parsing packet:', err);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('DISCONNECTED');
      if (burstIntervalRef.current) {
        clearInterval(burstIntervalRef.current);
        burstIntervalRef.current = null;
      }
      if (ntpIntervalRef.current) {
        clearInterval(ntpIntervalRef.current);
        ntpIntervalRef.current = null;
      }

      // Mobile resilience: Auto-reconnect on unexpected drop (cellular handover / backgrounding)
      if (!isIntentionalDisconnectRef.current && reconnectAttemptsRef.current < 5) {
        const backoffMs = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 5000);
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, backoffMs);
      }
    };

    ws.onerror = () => {
      setConnectionStatus('DISCONNECTED');
    };
  }, [serverUrl, mode, roomId, password, playerName, send, sendSyncPing]);

  const disconnect = useCallback(() => {
    isIntentionalDisconnectRef.current = true;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    reconnectAttemptsRef.current = 0;

    if (burstIntervalRef.current) {
      clearInterval(burstIntervalRef.current);
      burstIntervalRef.current = null;
    }
    if (ntpIntervalRef.current) {
      clearInterval(ntpIntervalRef.current);
      ntpIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('DISCONNECTED');
  }, []);

  // Listen for mobile AppState transitions (background -> foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && !isIntentionalDisconnectRef.current) {
        if (!wsRef.current || wsRef.current.readyState > WebSocket.OPEN) {
          connect();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [connect]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  const buzz = useCallback(() => {
    if (roomState !== 'STREAMING' || isLockedOut) return;

    AudioHaptics.playPochiBuzzer();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    const localTimestamp = Date.now();
    const adjustedTimestamp = localTimestamp + clockOffsetRef.current;

    send({
      type: 'BUZZ_REQUEST',
      localTimestamp,
      adjustedTimestamp,
    });
  }, [roomState, isLockedOut, send]);

  const submitAnswer = useCallback(
    (answer: string) => {
      send({
        type: 'SUBMIT_ANSWER',
        answer,
      });
    },
    [send]
  );

  const sendKeystroke = useCallback(
    (slots: string[]) => {
      send({
        type: 'KEYSTROKE',
        input: slots,
      });
    },
    [send]
  );

  const myPlayer = players.find((p) => p.id === myPlayerId) || null;
  const opponentPlayer = players.find((p) => p.id !== myPlayerId) || null;
  const isMyTurnToAnswer =
    roomState === 'ANSWERING' &&
    (Boolean(myPlayerId && activeBuzzerId === myPlayerId) ||
      Boolean(myPlayer && activeBuzzerName === myPlayer.name) ||
      (Boolean(activeBuzzerId) &&
        players.filter((p) => !p.id.startsWith('bot-')).length <= 1));
  const canBuzz =
    roomState === 'STREAMING' && !isLockedOut && !isStreamPaused;

  return {
    connectionStatus,
    connect,
    disconnect,
    roomCode,
    isPrivateRoom,
    joinError,
    rtt,
    clockOffset,
    isNtpCalibrated,
    roomState,
    players,
    myPlayer,
    opponentPlayer,
    round,
    totalRounds,
    category,
    streamedText,
    isStreamPaused,
    canBuzz,
    activeBuzzerId,
    activeBuzzerName,
    isMyTurnToAnswer,
    isLockedOut,
    setIsLockedOut,
    answerLength,
    tiles,
    options,
    cleanAnswer,
    opponentKeystrokes,
    resolvedAnswer,
    resolvedFullQuestion,
    winner,
    penaltyAlert,
    buzz,
    submitAnswer,
    sendKeystroke,
  };
}
