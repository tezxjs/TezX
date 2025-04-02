"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateID = generateID;
/**
 * Generate a unique request ID
 * @returns {string} - A unique request identifier
 */
function generateID() {
    const timestamp = Date.now().toString(16); // Convert current time to hexadecimal
    const random = Math.floor(Math.random() * 0xffffffffffff)
        .toString(16)
        .padStart(12, "0"); // 12 hex digits for randomness
    const pid = (process.pid % 0x10000).toString(16).padStart(4, "0"); // Process ID (optional, improves uniqueness)
    return `${timestamp}-${random}-${pid}`;
}
