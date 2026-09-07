/**
 * WebCrypto API & SubtleCrypto Polyfill for React Native & Expo.
 *
 * Provides standard W3C WebCrypto API (`crypto.getRandomValues` and `crypto.subtle.digest`)
 * so Supabase PKCE OAuth authentication can generate SHA-256 code challenges (`S256`)
 * without triggering "WebCrypto API is not supported" warnings or falling back to plain.
 *
 * 100% self-contained with zero native module or external package dependencies.
 */

// NIST SHA-256 round constants
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(x: number, n: number): number {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

/**
 * Pure TypeScript standard NIST SHA-256 digest function.
 * Produces an exact 32-byte cryptographic hash.
 */
function sha256Pure(bytes: Uint8Array): Uint8Array {
  let H0 = 0x6a09e667;
  let H1 = 0xbb67ae85;
  let H2 = 0x3c6ef372;
  let H3 = 0xa54ff53a;
  let H4 = 0x510e527f;
  let H5 = 0x9b05688c;
  let H6 = 0x1f83d9ab;
  let H7 = 0x5be0cd19;

  const l = bytes.length;
  const bitLen = l * 8;
  const newLen = ((l + 9 + 63) >> 6) << 6;
  const padded = new Uint8Array(newLen);
  padded.set(bytes);
  padded[l] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(newLen - 4, bitLen, false);

  const W = new Uint32Array(64);

  for (let i = 0; i < newLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 =
        (rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3)) >>> 0;
      const s1 =
        (rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10)) >>> 0;
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }

    let a = H0;
    let b = H1;
    let c = H2;
    let d = H3;
    let e = H4;
    let f = H5;
    let g = H6;
    let h = H7;

    for (let t = 0; t < 64; t++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H0 = (H0 + a) >>> 0;
    H1 = (H1 + b) >>> 0;
    H2 = (H2 + c) >>> 0;
    H3 = (H3 + d) >>> 0;
    H4 = (H4 + e) >>> 0;
    H5 = (H5 + f) >>> 0;
    H6 = (H6 + g) >>> 0;
    H7 = (H7 + h) >>> 0;
  }

  const result = new Uint8Array(32);
  const resView = new DataView(result.buffer);
  resView.setUint32(0, H0, false);
  resView.setUint32(4, H1, false);
  resView.setUint32(8, H2, false);
  resView.setUint32(12, H3, false);
  resView.setUint32(16, H4, false);
  resView.setUint32(20, H5, false);
  resView.setUint32(24, H6, false);
  resView.setUint32(28, H7, false);
  return result;
}

export function initCryptoPolyfill(): void {
  const g = globalThis as any;

  // 1. Initialize global crypto object if missing
  if (typeof g.crypto === 'undefined') {
    g.crypto = {};
  }

  // 2. Polyfill crypto.getRandomValues
  if (!g.crypto.getRandomValues) {
    g.crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
      if (!array) return array;
      const bytes = new Uint8Array(
        array.buffer,
        array.byteOffset,
        array.byteLength
      );
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }

  // 3. Polyfill crypto.subtle and subtle.digest
  if (!g.crypto.subtle) {
    g.crypto.subtle = {};
  }

  if (!g.crypto.subtle.digest) {
    g.crypto.subtle.digest = async (
      _algorithm: string | { name: string },
      data: ArrayBuffer | ArrayBufferView
    ): Promise<ArrayBuffer> => {
      let uint8: Uint8Array;
      if (data instanceof Uint8Array) {
        uint8 = data;
      } else if (ArrayBuffer.isView(data)) {
        uint8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
      } else if (data instanceof ArrayBuffer) {
        uint8 = new Uint8Array(data);
      } else {
        uint8 = new TextEncoder().encode(String(data));
      }

      // Compute standard SHA-256
      const hashBytes = sha256Pure(uint8);
      return hashBytes.buffer as ArrayBuffer;
    };
  }

  // 4. Ensure TextEncoder is available
  if (typeof g.TextEncoder === 'undefined') {
    g.TextEncoder = class TextEncoder {
      encode(input?: string): Uint8Array {
        const str = input === undefined ? '' : String(input);
        const bin: number[] = [];
        for (let i = 0; i < str.length; i++) {
          let c = str.charCodeAt(i);
          if (c < 128) {
            bin.push(c);
          } else if (c < 2048) {
            bin.push((c >> 6) | 192, (c & 63) | 128);
          } else if (
            (c & 0xfc00) === 0xd800 &&
            i + 1 < str.length &&
            (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00
          ) {
            c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
            bin.push(
              (c >> 18) | 240,
              ((c >> 12) & 63) | 128,
              ((c >> 6) & 63) | 128,
              (c & 63) | 128
            );
          } else {
            bin.push((c >> 12) | 224, ((c >> 6) & 63) | 128, (c & 63) | 128);
          }
        }
        return new Uint8Array(bin);
      }
    };
  }

  // 5. Ensure btoa is available
  if (typeof g.btoa === 'undefined') {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    g.btoa = (input: string = '') => {
      let str = input;
      let output = '';
      for (
        let block = 0, charCode, i = 0, map = chars;
        str.charAt(i | 0) || ((map = '='), i % 1);
        output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
      ) {
        charCode = str.charCodeAt((i += 3 / 4));
        if (charCode > 0xff) {
          throw new Error('btoa failed: The string to be encoded contains characters outside of the Latin1 range.');
        }
        block = (block << 8) | charCode;
      }
      return output;
    };
  }
}

// Automatically apply polyfill on import
initCryptoPolyfill();
