"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = sign;
exports.verify = verify;
function parseExpiry(exp) {
    const match = exp.match(/^(\d+)([smhd])$/);
    if (!match)
        return parseInt(exp, 10);
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
function uint8ToBase64(u8) {
    let binary = "";
    const len = u8.length;
    for (let i = 0; i < len; i++)
        binary += String.fromCharCode(u8[i]);
    return typeof btoa !== "undefined" ? btoa(binary) : fallbackBtoa(binary);
}
function base64ToUint8(base64) {
    const bin = typeof atob !== "undefined" ? atob(base64) : fallbackAtob(base64);
    const len = bin.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++)
        u8[i] = bin.charCodeAt(i);
    return u8;
}
function base64urlFromUint8(u8) {
    return uint8ToBase64(u8)
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
function base64urlEncodeString(str) {
    return base64urlFromUint8(encoder.encode(str));
}
function base64urlDecodeToString(input) {
    let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad)
        b64 += "=".repeat(4 - pad);
    const u8 = base64ToUint8(b64);
    return decoder.decode(u8);
}
function constantTimeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let res = 0;
    for (let i = 0; i < a.length; i++) {
        res |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return res === 0;
}
function mapAlg(alg) {
    if (alg === "HS256")
        return { name: "HMAC", hash: "SHA-256" };
    return { name: "HMAC", hash: "SHA-512" };
}
async function importKey(secret, alg) {
    const keyData = encoder.encode(secret);
    return crypto.subtle.importKey("raw", keyData, mapAlg(alg), false, [
        "sign",
        "verify",
    ]);
}
async function hmacSign(key, data) {
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return new Uint8Array(sig);
}
function fallbackBtoa(binaryStr) {
    let base64 = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
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
function fallbackAtob(b64) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
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
        if (enc3 !== 64 && enc3 !== -1)
            output += String.fromCharCode(chr2);
        if (enc4 !== 64 && enc4 !== -1)
            output += String.fromCharCode(chr3);
    }
    return output;
}
async function sign(payload, opts) {
    const alg = (opts?.algorithm || "HS256");
    const secret = opts?.secret || globalThis.JWT_SECRET || "tezx_secret";
    const header = { alg, typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const exp = typeof opts?.expiresIn === "string"
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
async function verify(token, secret) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3)
            return null;
        const [eh, ep, sig] = parts;
        const data = `${eh}.${ep}`;
        const headerJson = base64urlDecodeToString(eh);
        const header = JSON.parse(headerJson);
        const alg = header?.alg === "HS512" ? "HS512" : "HS256";
        const s = secret || globalThis.JWT_SECRET || "tezx_secret";
        const key = await importKey(s, alg);
        const expectedSigU8 = await hmacSign(key, data);
        const expectedSig = base64urlFromUint8(expectedSigU8);
        if (!constantTimeEqual(expectedSig, sig))
            return null;
        const payloadJson = base64urlDecodeToString(ep);
        const payload = JSON.parse(payloadJson);
        if (payload.exp && Date.now() / 1000 > payload.exp)
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
exports.default = { sign, verify };
