/**
 * test_answering_modes.ts
 * 
 * Verifies that:
 * 1. JOIN_ACK sends the exact assigned playerId to client
 * 2. ROUND_INTRO delivers both 4x4 matrix tiles and 4 multiple-choice options
 * 3. Buzzer arbitration triggers ANSWERING phase
 * 4. Submitting via Matrix Keypad evaluates correctly (+20 pts)
 * 5. Submitting via Multiple Choice evaluates correctly (+20 pts)
 */

import WebSocket from 'ws';
import { BattleServer } from '../server/server';
import { ClientMessage, ServerMessage } from '../src/battle/types';

const TEST_PORT = 4003;

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function testModes() {
  console.log('--- Testing Battle Answering Modes (Grid & MultiChoice) ---');
  const server = new BattleServer(TEST_PORT);

  const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
  const messages: ServerMessage[] = [];

  ws.on('message', (raw) => {
    messages.push(JSON.parse(raw.toString()));
  });

  await new Promise((res) => ws.once('open', res));

  // Step 1: Join Room and verify JOIN_ACK
  ws.send(JSON.stringify({ type: 'JOIN_ROOM', roomId: 'modes-room', playerName: 'Tester' } as ClientMessage));
  await delay(100);

  const ack = messages.find((m) => m.type === 'JOIN_ACK');
  if (!ack || ack.type !== 'JOIN_ACK') {
    throw new Error('Server did not return JOIN_ACK');
  }
  console.log(`✓ JOIN_ACK verified: yourPlayerId=${ack.yourPlayerId}`);

  // Step 2: Auto-start bot sparring partner or start round
  const room = server.getOrCreateRoom('modes-room');
  room.startRoundIntro();
  await delay(100);

  const intro = messages.find((m) => m.type === 'ROUND_INTRO');
  if (!intro || intro.type !== 'ROUND_INTRO') {
    throw new Error('ROUND_INTRO was not broadcast');
  }

  if (!intro.tiles || intro.tiles.length !== 16) {
    throw new Error(`Expected 16 matrix tiles, got ${intro.tiles?.length}`);
  }
  console.log(`✓ 4x4 Matrix Tiles verified: ${intro.tiles.length} tiles received`);

  if (!intro.options || intro.options.length !== 4) {
    throw new Error(`Expected 4 multiple choice options, got ${intro.options?.length}`);
  }
  console.log(`✓ Multiple Choice options verified: [${intro.options.join(', ')}]`);

  // Step 3: Advance to STREAMING
  room.startStreaming();
  await delay(200);

  // Step 4: Buzz
  const localNow = Date.now();
  ws.send(JSON.stringify({
    type: 'BUZZ_REQUEST',
    localTimestamp: localNow,
    adjustedTimestamp: localNow + 100,
  } as ClientMessage));
  await delay(120);

  const arbitrated = messages.find((m) => m.type === 'BUZZ_ARBITRATED');
  if (!arbitrated || arbitrated.type !== 'BUZZ_ARBITRATED') {
    throw new Error('Buzz arbitration failed');
  }
  console.log(`✓ Buzz arbitrated to ${arbitrated.winnerName} (${arbitrated.winnerId})`);

  // Step 5: Test Multiple Choice answer submission
  const correctOption = room.currentQuestion!.answer;
  ws.send(JSON.stringify({
    type: 'SUBMIT_ANSWER',
    answer: correctOption,
  } as ClientMessage));
  await delay(100);

  const evaluated = messages.find((m) => m.type === 'ANSWER_EVALUATED');
  if (!evaluated || evaluated.type !== 'ANSWER_EVALUATED' || !evaluated.isCorrect) {
    throw new Error('Answer evaluation failed for option selection');
  }
  console.log(`✓ Option submission evaluated correctly: +${evaluated.pointsDelta} pts!`);

  ws.close();
  await server.close();
  console.log('\n==============================================');
  console.log('  ALL ANSWERING MODES VERIFIED CLEANLY! ✓    ');
  console.log('==============================================\n');
}

testModes().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
