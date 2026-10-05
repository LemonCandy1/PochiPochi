/**
 * test_room_codes.ts
 *
 * Verifies private room code + password matchmaking:
 * 1. CREATE_ROOM returns a 5-char server-generated code
 * 2. Wrong password / unknown code / full room are rejected with JOIN_ERROR
 * 3. Correct code + password joins (case-insensitive) and the match auto-starts
 * 4. Private rooms never get PochiBot
 * 5. QUICK_MATCH pairs two waiting humans into the same public room
 * 6. A dropped player can rejoin a running private game with their score intact
 */

import WebSocket from 'ws';
import { BattleServer } from '../server/server';
import { ClientMessage, ServerMessage } from '../src/battle/types';

const TEST_PORT = 4006;

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function connect() {
  const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
  const messages: ServerMessage[] = [];
  ws.on('message', (raw) => messages.push(JSON.parse(raw.toString())));
  await new Promise((res) => ws.once('open', res));
  const send = (msg: ClientMessage) => ws.send(JSON.stringify(msg));
  const last = <T extends ServerMessage['type']>(type: T) =>
    [...messages].reverse().find((m) => m.type === type) as Extract<ServerMessage, { type: T }> | undefined;
  return { ws, messages, send, last };
}

async function runRoomCodeTest() {
  console.log('--- Testing Room Code + Password Matchmaking ---');
  const server = new BattleServer(TEST_PORT, { quickMatchBotDelayMs: 300 });

  try {
    // 1. Host creates a private room
    const host = await connect();
    host.send({ type: 'CREATE_ROOM', playerName: 'Host', password: '7788' });
    await delay(100);
    const hostAck = host.last('JOIN_ACK');
    assert(Boolean(hostAck), 'Host did not receive JOIN_ACK');
    assert(/^[A-Z2-9]{5}$/.test(hostAck!.roomId), `Unexpected room code: ${hostAck!.roomId}`);
    assert(hostAck!.isPrivate && hostAck!.isHost, 'Host room should be private and hosted');
    console.log(`✓ Private room created with code ${hostAck!.roomId}`);

    // Too-short password is rejected
    const weak = await connect();
    weak.send({ type: 'CREATE_ROOM', playerName: 'Weak', password: '12' });
    await delay(100);
    assert(weak.last('JOIN_ERROR')?.reason === 'BAD_PASSWORD', 'Short password should be rejected');
    weak.ws.close();
    console.log('✓ Too-short room password rejected');

    // 2. Rejections
    const guest = await connect();
    guest.send({ type: 'JOIN_ROOM', roomId: hostAck!.roomId, password: '0000', playerName: 'Guest' });
    await delay(100);
    assert(guest.last('JOIN_ERROR')?.reason === 'BAD_PASSWORD', 'Wrong password should be rejected');
    console.log('✓ Wrong password rejected');

    guest.send({ type: 'JOIN_ROOM', roomId: 'ZZZZZ', password: '7788', playerName: 'Guest' });
    await delay(100);
    assert(guest.last('JOIN_ERROR')?.reason === 'NOT_FOUND', 'Unknown code should be rejected');
    console.log('✓ Unknown room code rejected');

    // 4. No bot in a private room, even after the quick-match bot delay
    await delay(500);
    const lobby = host.last('ROOM_STATE');
    assert(
      !lobby || lobby.players.every((p) => !p.id.startsWith('bot-')),
      'PochiBot must not join private rooms'
    );
    console.log('✓ PochiBot stays out of private rooms');

    // 3. Correct code (typed lowercase with a dash) + password joins
    const typed = `${hostAck!.roomId.slice(0, 2)}-${hostAck!.roomId.slice(2)}`.toLowerCase();
    guest.send({ type: 'JOIN_ROOM', roomId: typed, password: '7788', playerName: 'Guest' });
    await delay(150);
    const guestAck = guest.last('JOIN_ACK');
    assert(guestAck?.roomId === hostAck!.roomId, 'Guest should join the host room');
    assert(!guestAck!.isHost, 'Guest should not be host');
    console.log('✓ Guest joined with code + password (case/dash-insensitive)');

    // Room is now full
    const third = await connect();
    third.send({ type: 'JOIN_ROOM', roomId: hostAck!.roomId, password: '7788', playerName: 'Third' });
    await delay(100);
    assert(third.last('JOIN_ERROR')?.reason === 'ROOM_FULL', 'Third player should see ROOM_FULL');
    third.ws.close();
    console.log('✓ Third player rejected: room full');

    // Match auto-starts with both humans
    await delay(1100);
    assert(Boolean(host.last('ROUND_INTRO')), 'Match should auto-start once the guest joins');
    console.log('✓ Match auto-started for host + guest');

    // 6. Guest drops and rejoins mid-game with score intact
    const room = server.getRoom(hostAck!.roomId)!;
    room.players.get(guestAck!.yourPlayerId)!.player.score = 30;
    guest.ws.close();
    await delay(100);
    const rejoin = await connect();
    rejoin.send({
      type: 'JOIN_ROOM',
      roomId: hostAck!.roomId,
      password: '7788',
      playerName: 'Guest',
      reconnectPlayerId: guestAck!.yourPlayerId,
    });
    await delay(100);
    assert(rejoin.last('JOIN_ACK')?.yourPlayerId === guestAck!.yourPlayerId, 'Rejoin should keep player id');
    assert(room.players.get(guestAck!.yourPlayerId)?.player.score === 30, 'Rejoin should restore score');
    console.log('✓ Dropped player rejoined mid-game with score intact');

    host.ws.close();
    rejoin.ws.close();
    guest.ws.close();

    // 5. Quick match pairs two humans into one public room
    const a = await connect();
    const b = await connect();
    a.send({ type: 'QUICK_MATCH', playerName: 'A' });
    await delay(50);
    b.send({ type: 'QUICK_MATCH', playerName: 'B' });
    await delay(100);
    const ackA = a.last('JOIN_ACK');
    const ackB = b.last('JOIN_ACK');
    assert(Boolean(ackA && ackB) && ackA!.roomId === ackB!.roomId, 'Quick match should pair A and B');
    assert(!ackA!.isPrivate, 'Quick match rooms are public');
    console.log(`✓ Quick match paired two players in room ${ackA!.roomId}`);
    a.ws.close();
    b.ws.close();

    // Solo quick match falls back to PochiBot
    const solo = await connect();
    solo.send({ type: 'QUICK_MATCH', playerName: 'Solo' });
    await delay(600);
    assert(
      Boolean(solo.last('ROOM_STATE')?.players.some((p) => p.id === 'bot-pochi')),
      'Solo quick match should get PochiBot'
    );
    console.log('✓ Solo quick match falls back to PochiBot');
    solo.ws.close();

    console.log('\n🎉 Room code tests passed!');
  } finally {
    await server.close();
  }
}

runRoomCodeTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Room code test failed:', err.message);
    process.exit(1);
  });
