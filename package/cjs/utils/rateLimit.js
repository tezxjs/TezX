"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRateLimitDefaultStorage = createRateLimitDefaultStorage;
exports.isRateLimit = isRateLimit;
function createRateLimitDefaultStorage() {
    const store = new Map();
    return {
        get: (key) => store.get(key),
        set: (key, value) => store.set(key, value),
        clearExpired: () => {
            const now = Date.now();
            for (const [key, entry] of store.entries()) {
                if (now >= entry.resetTime) {
                    store.delete(key);
                }
            }
        },
    };
}
function isRateLimit(key, store, maxRequests, windowMs) {
    store?.clearExpired();
    const now = Date.now();
    let entry = store.get(key) || { count: 0, resetTime: now + windowMs };
    if (now < entry.resetTime) {
        entry.count++;
        if (entry.count > maxRequests) {
            return {
                check: true,
                entry: entry,
            };
        }
    }
    else {
        entry = { count: 1, resetTime: now + windowMs };
    }
    store.set(key, entry);
    return {
        check: false,
        entry: entry,
    };
}
