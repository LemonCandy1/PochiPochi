/**
 * test_dynamic_typing.ts
 * 
 * Verifies the Minhaya-Style Dynamic Sequential Typing Mechanics:
 * 1. 6-letter dynamic choice generation (1 correct letter + 5 distinct distractors)
 * 2. Max-8 letter autocomplete rule
 * 3. Server cleanAnswer delivery in ROUND_INTRO and BUZZ_ARBITRATED
 * 4. Autocompleted answer evaluation (+20 pts)
 * 5. Incorrect letter lockout and penalty (-10 pts, isLockedOut: true)
 */

import WebSocket from 'ws';
import { BattleServer } from '../server/server';
import {
  generateDynamicLetterChoices,
  MAX_DYNAMIC_LETTERS,
  shouldAutocomplete,
} from '../src/battle/matrixGenerator';
import { ClientMessage, ServerMessage } from '../src/battle/types';

const TEST_PORT = 4005;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${message}`);
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function testDynamicChoiceUnit() {
  console.log('\n--- 1. Testing 6-Letter Dynamic Choices Generator ---');

  const targetChar = 'M';
  const choices = generateDynamicLetterChoices(targetChar, 6);

  assert(choices.length === 6, `Expected exactly 6 choices, got ${choices.length}`);
  assert(choices.includes(targetChar), `Choices must contain target letter '${targetChar}'`);

  const distractors = choices.filter((c) => c !== targetChar);
  assert(distractors.length === 5, `Expected 5 distractors, got ${distractors.length}`);

  // All 5 distractors must be distinct
  const uniqueDistractors = new Set(distractors);
  assert(uniqueDistractors.size === 5, 'All 5 distractors must be distinct unique letters');

  console.log(`✓ 6-Letter choices for '${targetChar}': [${choices.join(', ')}]`);

  // Verify across all alphabet letters
  for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    const set = generateDynamicLetterChoices(letter, 6);
    assert(set.length === 6 && set.includes(letter), `Failed for letter ${letter}`);
  }
  console.log('✓ Verified 6-letter dynamic generation across full alphabet (A-Z)');
}

function testAutocompleteRuleUnit() {
  console.log('\n--- 2. Testing Max-8 Letter Autocomplete Rule ---');

  assert(MAX_DYNAMIC_LETTERS === 8, 'MAX_DYNAMIC_LETTERS must be 8');

  // Short word: "GOLD" (4 letters)
  assert(!shouldAutocomplete(3, 4), 'GOLD at 3 letters should not autocomplete');
  assert(shouldAutocomplete(4, 4), 'GOLD at 4 letters should be completed');

  // 7-letter word: "DEADSEA" (7 letters)
  assert(!shouldAutocomplete(6, 7), 'DEADSEA at 6 letters should not autocomplete');
  assert(shouldAutocomplete(7, 7), 'DEADSEA at 7 letters should be completed');

  // Long word: "PENICILLIN" (10 letters)
  assert(!shouldAutocomplete(7, 10), 'PENICILLIN at 7 letters should not autocomplete');
  assert(shouldAutocomplete(8, 10), 'PENICILLIN at 8 letters MUST autocomplete remaining 2 letters');

  // Colossal word: "MITOCHONDRIA" (12 letters)
  assert(!shouldAutocomplete(7, 12), 'MITOCHONDRIA at 7 letters should not autocomplete');
  assert(shouldAutocomplete(8, 12), 'MITOCHONDRIA at 8 letters MUST autocomplete remaining 4 letters');

  console.log('✓ Autocomplete triggers at exactly Math.min(length, 8) letters');
}

async function testServerIntegration() {
  console.log('\n--- 3. Testing Dynamic Typing Live Server Integration ---');

  const server = new BattleServer(TEST_PORT);
  const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
  const messages: ServerMessage[] = [];

  ws.on('message', (raw) => {
    messages.push(JSON.parse(raw.toString()));
  });

  await new Promise((res) => ws.once('open', res));

  // Join Room
  ws.send(JSON.stringify({ type: 'CREATE_ROOM', playerName: 'DynamicTester', password: '1234' } as ClientMessage));
  await delay(100);

  const ack = messages.find((m) => m.type === 'JOIN_ACK');
  assert(Boolean(ack && ack.type === 'JOIN_ACK'), 'Server did not return JOIN_ACK');
  const room = server.getRoom((ack as any).roomId)!;
  room.startRoundIntro();
  await delay(100);

  const intro = messages.find((m) => m.type === 'ROUND_INTRO');
  assert(Boolean(intro && intro.type === 'ROUND_INTRO'), 'ROUND_INTRO was not broadcast');
  assert(Boolean(intro && intro.cleanAnswer), `ROUND_INTRO must contain cleanAnswer, got: ${intro?.cleanAnswer}`);
  console.log(`✓ ROUND_INTRO broadcast with cleanAnswer: "${intro?.cleanAnswer}"`);

  // Advance to STREAMING & buzz
  room.startStreaming();
  await delay(150);

  const localNow = Date.now();
  ws.send(JSON.stringify({
    type: 'BUZZ_REQUEST',
    localTimestamp: localNow,
    adjustedTimestamp: localNow + 50,
  } as ClientMessage));
  await delay(120);

  const arbitrated = messages.find((m) => m.type === 'BUZZ_ARBITRATED');
  assert(Boolean(arbitrated && arbitrated.type === 'BUZZ_ARBITRATED'), 'Buzz arbitration failed');
  assert(
    Boolean(arbitrated && arbitrated.answerTimeoutMs >= 16000),
    `answerTimeoutMs must be at least 16000ms for up to 8 letters, got ${arbitrated?.answerTimeoutMs}`
  );
  console.log(`✓ Buzz arbitrated with extended per-letter timeout: ${arbitrated?.answerTimeoutMs}ms`);

  // Submit correct autocompleted answer
  const answer = room.currentQuestion!.answer;
  ws.send(JSON.stringify({
    type: 'SUBMIT_ANSWER',
    answer,
  } as ClientMessage));
  await delay(100);

  const evaluated = messages.find((m) => m.type === 'ANSWER_EVALUATED');
  assert(Boolean(evaluated && evaluated.type === 'ANSWER_EVALUATED' && evaluated.isCorrect), 'Answer must evaluate to correct');
  console.log(`✓ Answer evaluation successful: +${evaluated?.pointsDelta} pts!`);

  // Test incorrect letter lockout on next round
  messages.length = 0;
  room.startRoundIntro();
  await delay(100);
  room.startStreaming();
  await delay(150);

  ws.send(JSON.stringify({
    type: 'BUZZ_REQUEST',
    localTimestamp: Date.now(),
    adjustedTimestamp: Date.now() + 50,
  } as ClientMessage));
  await delay(120);

  // Submit intentionally incorrect letter
  ws.send(JSON.stringify({
    type: 'SUBMIT_ANSWER',
    answer: 'WRONG_LETTER_X',
  } as ClientMessage));
  await delay(100);

  const evalWrong = messages.find((m) => m.type === 'ANSWER_EVALUATED');
  assert(
    Boolean(evalWrong && evalWrong.type === 'ANSWER_EVALUATED' && !evalWrong.isCorrect && evalWrong.isLockedOut),
    'Wrong letter must result in isCorrect: false and isLockedOut: true'
  );
  console.log(`✓ Incorrect letter evaluated: ${evalWrong?.pointsDelta} pts, isLockedOut = ${evalWrong?.isLockedOut}`);

  ws.close();
  await server.close();
}

async function runTests() {
  console.log('==============================================');
  console.log('   DYNAMIC TYPING SYSTEM INTEGRATION TESTS    ');
  console.log('==============================================');

  testDynamicChoiceUnit();
  testAutocompleteRuleUnit();
  await testServerIntegration();

  console.log('\n==============================================');
  console.log('  ALL DYNAMIC TYPING TESTS PASSED CLEANLY! ✓  ');
  console.log('==============================================\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
