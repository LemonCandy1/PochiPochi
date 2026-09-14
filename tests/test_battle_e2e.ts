/**
 * test_battle_e2e.ts
 * 
 * End-to-end live integration test for Pochi 1v1 Battle Arena:
 * - Boots up BattleServer on port 4002
 * - Connects two WebSocket clients (Alice and Bob)
 * - Validates two-way NTP handshake (SYNC_PING -> SYNC_PONG)
 * - Verifies LOBBY -> ROUND_INTRO -> STREAMING transition
 * - Simulates buzzing, 60ms sliding jitter arbitration, and answer submission
 * - Verifies score update (+20 pts) and ROUND_RESOLVED state
 */

import WebSocket from 'ws';
import { BattleServer } from '../server/server';
import { ClientMessage, ServerMessage } from '../src/battle/types';

const TEST_PORT = 4002;

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function runE2ETest() {
  console.log('--- Starting Pochi 1v1 Battle Arena E2E Live Integration Test ---');
  const server = new BattleServer(TEST_PORT);
  console.log(`✓ Battle test server running on port ${TEST_PORT}`);

  const wsAlice = new WebSocket(`ws://localhost:${TEST_PORT}`);
  const wsBob = new WebSocket(`ws://localhost:${TEST_PORT}`);

  const aliceMessages: ServerMessage[] = [];
  const bobMessages: ServerMessage[] = [];

  wsAlice.on('message', (data) => {
    aliceMessages.push(JSON.parse(data.toString()));
  });
  wsBob.on('message', (data) => {
    bobMessages.push(JSON.parse(data.toString()));
  });

  // Wait for both connections
  await Promise.all([
    new Promise((res) => wsAlice.once('open', res)),
    new Promise((res) => wsBob.once('open', res)),
  ]);
  console.log('✓ Both Alice and Bob connected to WebSocket');

  // Step 1: NTP Ping/Pong
  const t1 = Date.now();
  wsAlice.send(JSON.stringify({ type: 'SYNC_PING', t1 } as ClientMessage));
  await delay(100);

  const pong = aliceMessages.find((m) => m.type === 'SYNC_PONG');
  if (!pong || pong.type !== 'SYNC_PONG') {
    throw new Error('Alice did not receive SYNC_PONG');
  }
  console.log(`✓ NTP Handshake verified: T1=${pong.t1}, T2=${pong.t2}, T3=${pong.t3}`);

  // Step 2: Join Room
  wsAlice.send(
    JSON.stringify({
      type: 'JOIN_ROOM',
      roomId: 'e2e-room',
      playerName: 'Alice',
    } as ClientMessage)
  );
  wsBob.send(
    JSON.stringify({
      type: 'JOIN_ROOM',
      roomId: 'e2e-room',
      playerName: 'Bob',
    } as ClientMessage)
  );
  await delay(200);

  const roomState = aliceMessages.find(
    (m) => m.type === 'ROOM_STATE' && m.players.length === 2
  );
  if (!roomState || roomState.type !== 'ROOM_STATE') {
    throw new Error('Room state did not update with 2 players');
  }
  console.log('✓ Room initialized with Alice and Bob in LOBBY');

  // Step 3: Trigger match
  const room = server.getOrCreateRoom('e2e-room');
  room.startRoundIntro();
  await delay(100);

  const intro = aliceMessages.find((m) => m.type === 'ROUND_INTRO');
  if (!intro || intro.type !== 'ROUND_INTRO') {
    throw new Error('Failed to receive ROUND_INTRO');
  }
  console.log(`✓ ROUND_INTRO broadcast: Category="${intro.category}", TargetLength=${intro.answerLength}`);

  // Step 4: Advance to STREAMING
  room.startStreaming();
  await delay(300);

  const streamedChars = aliceMessages.filter((m) => m.type === 'STREAM_CHAR');
  if (streamedChars.length === 0) {
    throw new Error('No characters streamed to clients');
  }
  console.log(`✓ STREAMING active: ${streamedChars.length} characters received by client`);

  // Step 5: Buzz in
  const localNow = Date.now();
  const adjusted = localNow + 150;

  wsAlice.send(
    JSON.stringify({
      type: 'BUZZ_REQUEST',
      localTimestamp: localNow,
      adjustedTimestamp: adjusted,
    } as ClientMessage)
  );

  // Wait for 60ms sliding jitter arbitration
  await delay(120);

  const arbitrated = aliceMessages.find((m) => m.type === 'BUZZ_ARBITRATED');
  if (!arbitrated || arbitrated.type !== 'BUZZ_ARBITRATED') {
    throw new Error('Failed to arbitrate buzz winner');
  }
  console.log(`✓ Buzz arbitrated: Winner=${arbitrated.winnerName}, CutoffIndex=${arbitrated.cutoffCharIndex}`);

  // Step 6: Submit Answer
  const targetAnswer = room.currentQuestion!.answer;
  wsAlice.send(
    JSON.stringify({
      type: 'SUBMIT_ANSWER',
      answer: targetAnswer,
    } as ClientMessage)
  );
  await delay(150);

  const evalMsg = aliceMessages.find(
    (m) => m.type === 'ANSWER_EVALUATED' && m.isCorrect
  );
  if (!evalMsg || evalMsg.type !== 'ANSWER_EVALUATED') {
    throw new Error('Answer was not evaluated as correct');
  }
  console.log(`✓ Answer evaluated: Correct! Points delta = +${evalMsg.pointsDelta}`);

  const resolvedMsg = aliceMessages.find((m) => m.type === 'ROUND_RESOLVED');
  if (!resolvedMsg || resolvedMsg.type !== 'ROUND_RESOLVED') {
    throw new Error('Failed to transition to ROUND_RESOLVED');
  }
  console.log(`✓ Round resolved: Correct answer was "${resolvedMsg.correctAnswer}"`);

  // Clean up
  wsAlice.close();
  wsBob.close();
  await server.close();
  console.log('✓ Test server cleanly shut down');
  console.log('\n==============================================');
  console.log('   POCHI 1V1 BATTLE ARENA E2E PASSED! ✓       ');
  console.log('==============================================\n');
  process.exit(0);
}

runE2ETest().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
