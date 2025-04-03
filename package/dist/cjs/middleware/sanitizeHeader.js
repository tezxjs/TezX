"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHeaders = void 0;
const config_1 = require("../config/config");
/**
 * 🧼 Middleware to sanitize HTTP headers for security and compliance
 *
 * Removes dangerous headers, enforces allow/block lists, and normalizes headers.
 * Protects against header injection and information leakage.
 *
 * @param {SanitizeHeadersOptions} [options={}] - Configuration options
 * @returns {Middleware} Middleware function
 *
 * @example
 * // Basic usage with defaults
 * app.use(sanitizeHeaders());
 *
 * // Strict configuration
 * app.use(sanitizeHeaders({
 *   whitelist: ['accept', 'content-type'],
 *   normalizeKeys: true
 * }));
 */
const sanitizeHeaders = (options = {}) => {
    // Destructure with defaults
    const { whitelist = [], blacklist = [], normalizeKeys = true, allowUnsafeCharacters = false, } = options;
    return async (ctx, next) => {
        const sanitizedHeaders = new Map();
        // 🔄 Process each header entry
        for (const [key, values] of ctx.headers.entries()) {
            if (!Array.isArray(values) || values.length === 0) {
                continue; // Skip empty or malformed headers
            }
            // 🔠 Normalize header key if enabled
            const normalizedKey = normalizeKeys ? key.toLowerCase() : key;
            // ⚖️ Check against security lists
            if (whitelist.length > 0 &&
                !whitelist.some((r) => r?.toLowerCase() === normalizedKey)) {
                config_1.GlobalConfig.debugging.warn(`🚫 Header "${normalizedKey}" not in whitelist - removed`);
                continue;
            }
            if (blacklist.some((r) => r.toLowerCase() === normalizedKey)) {
                config_1.GlobalConfig.debugging.warn(`🚫 Header "${normalizedKey}" in blacklist - removed`);
                continue;
            }
            // 🛡️ Validate header name format
            if (!isValidHeaderName(normalizedKey)) {
                config_1.GlobalConfig.debugging.warn(`⚠️ Invalid header name: "${normalizedKey}" - removed`);
                continue;
            }
            // 🧹 Sanitize each header value
            const sanitizedValues = values
                .map((value) => sanitizeHeaderValue(value, allowUnsafeCharacters))
                .filter(Boolean); // Remove empty values
            if (sanitizedValues.length === 0) {
                config_1.GlobalConfig.debugging.warn(`⚠️ All values for "${normalizedKey}" invalid - removed`);
                continue;
            }
            // ✅ Add sanitized header to new collection
            sanitizedHeaders.set(normalizedKey, sanitizedValues);
        }
        // 🔄 Replace original headers with sanitized versions
        ctx.headers.clear().add([...sanitizedHeaders.entries()]);
        // ⏭️ Proceed to next middleware
        return await next();
    };
};
exports.sanitizeHeaders = sanitizeHeaders;
/**
 * 🔍 Validates header name against RFC 7230 standards
 * @param name - Header name to validate
 * @returns True if valid header name format
 *
 * @private
 */
const isValidHeaderName = (name) => {
    const HEADER_NAME_REGEX = /^[a-zA-Z0-9\-_]+$/;
    return HEADER_NAME_REGEX.test(name);
};
/**
 * 🧽 Sanitizes header value by removing dangerous sequences
 * @param value - Original header value
 * @param allowUnsafeCharacters - Whether to permit risky chars
 * @returns Sanitized value or empty string if invalid
 *
 * @private
 */
const sanitizeHeaderValue = (value, allowUnsafeCharacters) => {
    let sanitized = value.trim();
    if (!allowUnsafeCharacters) {
        // Remove CRLF sequences and control characters
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
    }
    return sanitized;
};
