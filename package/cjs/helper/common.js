"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateID = generateID;
function generateID() {
  const timestamp = Date.now().toString(16);
  const random = Math.floor(Math.random() * 0xffffffffffff)
    .toString(16)
    .padStart(12, "0");
  const pid = (process.pid % 0x10000).toString(16).padStart(4, "0");
  return `${timestamp}-${random}-${pid}`;
}
