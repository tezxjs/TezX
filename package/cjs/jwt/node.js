"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sign = sign;
exports.verify = verify;
const node_buffer_1 = require("node:buffer");
const node_crypto_1 = __importDefault(require("node:crypto"));
function base64url(input) {
    return node_buffer_1.Buffer.from(input)
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}
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
function base64urlDecode(input) {
    input = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = input.length % 4;
    if (pad)
        input += "=".repeat(4 - pad);
    return node_buffer_1.Buffer.from(input, "base64").toString("utf8");
}
function sign(payload, options) {
    const header = {
        alg: options?.algorithm || "HS256",
        typ: "JWT",
    };
    const now = Math.floor(Date.now() / 1000);
    const exp = typeof options?.expiresIn === "string"
        ? now + parseExpiry(options.expiresIn)
        : typeof options?.expiresIn === "number"
            ? now + options.expiresIn
            : now + 86400;
    const fullPayload = { ...payload, iat: now, exp };
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(fullPayload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const secret = options?.secret || process.env.JWT_SECRET || "tezx_secret";
    const signature = node_crypto_1.default
        .createHmac(header.alg === "HS512" ? "sha512" : "sha256", secret)
        .update(data)
        .digest("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    return `${data}.${signature}`;
}
function verify(token, secret) {
    try {
        const [encodedHeader, encodedPayload, signature] = token.split(".");
        const data = `${encodedHeader}.${encodedPayload}`;
        const decodedHeader = JSON.parse(base64urlDecode(encodedHeader));
        const expectedSig = node_crypto_1.default
            .createHmac(decodedHeader.alg === "HS512" ? "sha512" : "sha256", secret || process.env.JWT_SECRET || "tezx_secret")
            .update(data)
            .digest("base64")
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
        if (expectedSig !== signature)
            return null;
        const payload = JSON.parse(base64urlDecode(encodedPayload));
        if (payload.exp && Date.now() / 1000 > payload.exp)
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
exports.default = {
    verify,
    sign,
};
