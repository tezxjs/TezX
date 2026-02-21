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
function base64ToUint8(base64) {
    const bin = atob(base64);
    const len = bin.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++)
        u8[i] = bin.charCodeAt(i);
    return u8;
}
function base64urlFromUint8(u8) {
    let binary = "";
    const len = u8.length;
    for (let i = 0; i < len; i++)
        binary += String.fromCharCode(u8[i]);
    return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
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
    switch (alg) {
        case "HS1": return { name: "HMAC", hash: "SHA-1" };
        case "HS256": return { name: "HMAC", hash: "SHA-256" };
        case "HS384": return { name: "HMAC", hash: "SHA-384" };
        case "HS512": return { name: "HMAC", hash: "SHA-512" };
    }
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
export async function sign(payload, opts) {
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
export async function verify(token, secret) {
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
export default { sign, verify };
