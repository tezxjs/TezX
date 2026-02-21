"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateID = generateID;
exports.generateUUID = generateUUID;
exports.generateRandomBase64 = generateRandomBase64;
function generateID() {
    const timestamp = Date.now().toString(16);
    const randomHex = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, "0");
    return `${timestamp}-${randomHex}`;
}
function generateUUID() {
    return crypto.randomUUID();
}
function generateRandomBase64(length = 16) {
    let result = "";
    const BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (let i = 0; i < length; i++) {
        const idx = Math.floor(Math.random() * 64);
        result += BASE64[idx];
    }
    return result;
}
