// jwt-webcrypto.ts

import { base64Decode } from "../utils/buffer";

// Works in browsers, Deno, Bun (modern runtimes with globalThis.crypto.subtle and btoa/atob)
type Alg = "HS256" | "HS512";
function parseExpiry(exp: string): number {
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) return parseInt(exp, 10);
  const [, val, unit] = match;
  const num = parseInt(val, 10);
  switch (unit) {
    case "s":
      return num;
    case "m":
      return num * 60;
    case "h":
      return num * 3600;
    case "d":
      return num * 86400;
    default:
      return num;
  }
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** uint8 -> base64 (uses btoa on binary string) */
function uint8ToBase64(u8: Uint8Array): string {
  let binary = "";
  const len = u8.length;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(u8[i]);
  // btoa exists in browsers, Deno, Bun
  return typeof btoa !== "undefined" ? btoa(binary) : fallbackBtoa(binary);
}

/** base64 -> Uint8Array (uses atob) */
function base64ToUint8(base64: string): Uint8Array {
  const bin = typeof atob !== "undefined" ? atob(base64) : fallbackAtob(base64);
  const len = bin.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

/** base64url encode (no padding) */
function base64urlFromUint8(u8: Uint8Array) {
  return uint8ToBase64(u8)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/** base64url encode string */
function base64urlEncodeString(str: string) {
  return base64urlFromUint8(encoder.encode(str));
}

/** base64url decode to string */
function base64urlDecodeToString(input: string) {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  const u8 = base64ToUint8(b64);
  return decoder.decode(u8);
}

/** constant-time string compare */
function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let res = 0;
  for (let i = 0; i < a.length; i++) {
    res |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return res === 0;
}

/** Map 'alg' to WebCrypto algo name & HMAC length */
function mapAlg(alg: Alg) {
  if (alg === "HS256") return { name: "HMAC", hash: "SHA-256" as const };
  return { name: "HMAC", hash: "SHA-512" as const };
}

/** Import raw secret into CryptoKey for HMAC */
async function importKey(secret: string, alg: Alg) {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey("raw", keyData, mapAlg(alg), false, [
    "sign",
    "verify",
  ]);
}

/** Generate HMAC signature (Uint8Array) */
async function hmacSign(key: CryptoKey, data: string) {
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(sig);
}

/** small fallback for btoa/atob if environment lacks them (rare) */
function fallbackBtoa(binaryStr: string) {
  // fallback using base64 from binary string -> but we avoid Buffer here;
  // This fallback is minimal and may not exist in truly minimal runtimes.
  // If you're on Node.js, consider adding a small polyfill using Buffer.
  let base64 = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let i = 0;
  const len = binaryStr.length;
  while (i < len) {
    const c1 = binaryStr.charCodeAt(i++) & 0xff;
    if (i === len) {
      base64 += chars.charAt(c1 >> 2);
      base64 += chars.charAt((c1 & 0x3) << 4);
      base64 += "==";
      break;
    }
    const c2 = binaryStr.charCodeAt(i++);
    if (i === len) {
      base64 += chars.charAt(c1 >> 2);
      base64 += chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
      base64 += chars.charAt((c2 & 0xf) << 2);
      base64 += "=";
      break;
    }
    const c3 = binaryStr.charCodeAt(i++);
    base64 += chars.charAt(c1 >> 2);
    base64 += chars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
    base64 += chars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
    base64 += chars.charAt(c3 & 0x3f);
  }
  return base64;
}

function fallbackAtob(b64: string) {
  // Reverse of fallbackBtoa: decode base64 string -> binary string
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let output = "";
  let i = 0;
  b64 = b64.replace(/[^A-Za-z0-9\+\/]/g, "");
  while (i < b64.length) {
    const enc1 = chars.indexOf(b64.charAt(i++));
    const enc2 = chars.indexOf(b64.charAt(i++));
    const enc3 = chars.indexOf(b64.charAt(i++));
    const enc4 = chars.indexOf(b64.charAt(i++));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64 && enc3 !== -1) output += String.fromCharCode(chr2);
    if (enc4 !== 64 && enc4 !== -1) output += String.fromCharCode(chr3);
  }
  return output;
}

/** Sign payload and return JWT (async) */
export async function sign(
  payload: Record<string, any>,
  opts?: { secret?: string; algorithm?: Alg; expiresIn?: string | number },
): Promise<string> {
  const alg = (opts?.algorithm || "HS256") as Alg;
  const secret =
    opts?.secret || (globalThis as any).JWT_SECRET || "tezx_secret";
  const header = { alg, typ: "JWT" };

  const now = Math.floor(Date.now() / 1000);
  const exp =
    typeof opts?.expiresIn === "string"
      ? now + parseExpiry(opts.expiresIn)
      : typeof opts?.expiresIn === "number"
        ? now + opts.expiresIn
        : now + 86400;

  const fullPayload = { ...payload, iat: now, exp };

  const encodedHeader = base64urlEncodeString(JSON.stringify(header));
  const encodedPayload = base64urlEncodeString(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const key = await importKey(secret, alg);
  const sigU8 = await hmacSign(key, data);
  const signature = base64urlFromUint8(sigU8);

  return `${data}.${signature}`;
}

/** Verify JWT, return payload or null */
export async function verify(
  token: string,
  secret?: string,
): Promise<Record<string, any> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [eh, ep, sig] = parts;
    const data = `${eh}.${ep}`;

    const headerJson = base64Decode(eh);
    const header = JSON.parse(headerJson) as { alg?: string };

    const alg: Alg = header?.alg === "HS512" ? "HS512" : "HS256";
    const s = secret || (globalThis as any).JWT_SECRET || "tezx_secret";

    const key = await importKey(s, alg);
    const expectedSigU8 = await hmacSign(key, data);
    const expectedSig = base64urlFromUint8(expectedSigU8);

    if (!constantTimeEqual(expectedSig, sig)) return null;

    const payloadJson = base64Decode(ep);
    const payload = JSON.parse(payloadJson) as Record<string, any>;
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export default { sign, verify };
