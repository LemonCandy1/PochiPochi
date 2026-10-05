/**
 * roomCode.ts
 *
 * Room code & password rules shared by the battle server and the app,
 * so both sides agree on what a valid code/password looks like.
 */

// No 0/O/1/I so codes are easy to read aloud and type
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_LENGTH = 5;
export const MIN_PASSWORD_LENGTH = 4;
export const MAX_PASSWORD_LENGTH = 12;

/** Uppercases and strips anything that can't appear in a room code (spaces, dashes, etc.). */
export function normalizeRoomCode(input: string): string {
  return (input || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, ROOM_CODE_LENGTH);
}

export function isValidRoomCode(input: string): boolean {
  return input.length === ROOM_CODE_LENGTH && [...input].every((c) => ROOM_CODE_ALPHABET.includes(c));
}

export function isValidRoomPassword(input: string): boolean {
  const len = (input || '').trim().length;
  return len >= MIN_PASSWORD_LENGTH && len <= MAX_PASSWORD_LENGTH;
}

/** A 4-digit PIN to prefill when hosting, so creating a room is one tap. */
export function generateRoomPin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
