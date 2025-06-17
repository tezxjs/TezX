"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitized = sanitized;
function sanitized(title) {
    const base = title
        .toLowerCase()
        .trim()
        .replace(/[_\s]+/g, "-")
        .replace(/[^a-z0-9-.]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+|-+$/g, "");
    return base;
}
