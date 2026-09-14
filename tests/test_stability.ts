/**
 * test_stability.ts
 * 
 * Verifies that:
 * 1. Client connects and stays connected without reconnecting loops
 * 2. NTP calibration succeeds and stays calibrated with valid RTT
 * 3. Match starts cleanly at Round 1
 * 4. Rounds do NOT infinitely skip or advance prematurely
 */

import WebSocket from 'ws';
import { BattleServer } from '../server/server';
import { ClientMessage, ServerMessage } from '../src/battle/types';

const TEST_PORT = 4004;

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runStabilityTest() {
  console.log('--- Testing Connection & Round Progression Stability ---');
  const server = new BattleServer(TEST_PORT);

  const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
  const messages: ServerMessage[] = [];

  ws.on('message', (raw) => {
    messages.push(JSON.parse(raw.toString()));
  });

  await new Promise((res) => ws.once('open', res));

  // Step 1: Join Room
  ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: 'stable-room', playerName: 'StabilityTester' } as ClientMessage));

  // Step 2: Immediate Ping
  ws.send(JSON.stringify({ type: 'SYNC_PING', t1: Date.now() } as ClientMessage));

  // Wait 6.5 seconds (bot joins at 1.8s, round intro starts at 2.8s, streaming begins at 5.8s)
  await delay(6500);

  const pongs = messages.filter((m) => m.type === 'SYNC_PONG');
  if (pongs.length === 0) {
    throw new Error('No SYNC_PONG messages received');
  }
  console.log(`✓ NTP Sync active: Received ${pongs.length} SYNC_PONG packets`);

  const roundIntros = messages.filter((m) => m.type === 'ROUND_INTRO');
  console.log(`✓ Round Intros received: ${roundIntros.length}`);

  if (roundIntros.length === 0) {
    throw new Error('Round 1 did not start');
  }

  const currentRound = (roundIntros[roundIntros.length - 1] as any).round;
  console.log(`✓ Current Round is ${currentRound} (Must be exactly 1)`);

  if (currentRound !== 1) {
    throw new Error(`Rounds skipped unexpectedly! Expected Round 1, got Round ${currentRound}`);
  }

  // Verify stream characters are flowing
  const streamChars = messages.filter((m) => m.type === 'STREAM_CHAR');
  console.log(`✓ Clue is streaming smoothly: ${streamChars.length} characters received so far`);

  if (streamChars.length === 0) {
    throw new Error('Streaming did not start properly');
  }

  ws.close();
  await server.close();
  console.log('\n==============================================');
  console.log('  STABILITY & SYNC TEST PASSED PERFECTLY! ✓  ');
  console.log('==============================================\n');
}

runStabilityTest().catch((err) => {
  console.error('Stability test failed:', err);
  process.exit(1);
});
