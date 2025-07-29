import { GlobalConfig } from "../../core/config.js";
const sanitizeHeaders = (options = {}) => {
    const { whitelist = [], blacklist = [], allowUnsafeCharacters = false, } = options;
    const normalizedWhitelist = whitelist.map(h => h.toLowerCase());
    const normalizedBlacklist = blacklist.map(h => h.toLowerCase());
    return async function sanitizeHeaders(ctx, next) {
        const sanitizedHeaders = {};
        for (const key in ctx.header()) {
            let value = ctx.header(key);
            const normalizedKey = key.toLowerCase();
            if (normalizedWhitelist.length > 0 && !normalizedWhitelist.includes(normalizedKey)) {
                GlobalConfig.debugging.warn(`🚫 Header "${key}" not in whitelist - removed`);
                continue;
            }
            if (normalizedBlacklist.includes(normalizedKey)) {
                GlobalConfig.debugging.warn(`🚫 Header "${key}" in blacklist - removed`);
                continue;
            }
            if (!isValidHeaderName(normalizedKey)) {
                GlobalConfig.debugging.warn(`⚠️ Invalid header name: "${normalizedKey}" - removed`);
                continue;
            }
            const sanitizedValue = sanitizeHeaderValue(value, allowUnsafeCharacters);
            if (!sanitizedValue) {
                GlobalConfig.debugging.warn(`⚠️ Header "${key}" has invalid/empty value - removed`);
                continue;
            }
            sanitizedHeaders[normalizedKey] = sanitizedValue;
        }
        for (const k in sanitizedHeaders) {
            let v = sanitizedHeaders[k];
            ctx.setHeader(k, v);
        }
        ;
        ctx.clearHeader = sanitizedHeaders;
        return await next();
    };
};
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
export { sanitizeHeaders as default, sanitizeHeaders };
