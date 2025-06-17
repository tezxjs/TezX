"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHeaders = void 0;
const config_js_1 = require("../core/config.js");
const sanitizeHeaders = (options = {}) => {
    const { whitelist = [], blacklist = [], normalizeKeys = true, allowUnsafeCharacters = false, } = options;
    return async function sanitizeHeaders(ctx, next) {
        const sanitizedHeaders = new Map();
        for (const [key, values] of ctx.headers.entries()) {
            if (!Array.isArray(values) || values.length === 0) {
                continue;
            }
            const normalizedKey = normalizeKeys ? key.toLowerCase() : key;
            if (whitelist.length > 0 &&
                !whitelist.some((r) => r?.toLowerCase() === normalizedKey)) {
                config_js_1.GlobalConfig.debugging.warn(`🚫 Header "${normalizedKey}" not in whitelist - removed`);
                continue;
            }
            if (blacklist.some((r) => r.toLowerCase() === normalizedKey)) {
                config_js_1.GlobalConfig.debugging.warn(`🚫 Header "${normalizedKey}" in blacklist - removed`);
                continue;
            }
            if (!isValidHeaderName(normalizedKey)) {
                config_js_1.GlobalConfig.debugging.warn(`⚠️ Invalid header name: "${normalizedKey}" - removed`);
                continue;
            }
            const sanitizedValues = values
                .map((value) => sanitizeHeaderValue(value, allowUnsafeCharacters))
                .filter(Boolean);
            if (sanitizedValues.length === 0) {
                config_js_1.GlobalConfig.debugging.warn(`⚠️ All values for "${normalizedKey}" invalid - removed`);
                continue;
            }
            sanitizedHeaders.set(normalizedKey, sanitizedValues?.join(", "));
        }
        ctx.headers = new Headers(sanitizedHeaders);
        return await next();
    };
};
exports.sanitizeHeaders = sanitizeHeaders;
const isValidHeaderName = (name) => {
    const HEADER_NAME_REGEX = /^[a-zA-Z0-9\-_]+$/;
    return HEADER_NAME_REGEX.test(name);
};
const sanitizeHeaderValue = (value, allowUnsafeCharacters) => {
    let sanitized = value.trim();
    if (!allowUnsafeCharacters) {
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
    }
    return sanitized;
};
