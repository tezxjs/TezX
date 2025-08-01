"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateID = generateID;
exports.generateUUID = generateUUID;
function generateID() {
    const timestamp = Date.now().toString(16);
    let randomHex = "";
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
        const array = new Uint8Array(6);
        crypto.getRandomValues(array);
        for (let i = 0; i < array.length; i++) {
            randomHex += array[i].toString(16).padStart(2, "0");
        }
    }
    else {
        randomHex = Math.floor(Math.random() * 0xffffffffffff)
            .toString(16)
            .padStart(12, "0");
    }
    return `${timestamp}-${randomHex}`;
}
function generateUUID() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
        return crypto.randomUUID();
    return generateID();
}
