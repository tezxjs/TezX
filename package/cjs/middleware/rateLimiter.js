"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const rateLimiter = (options) => {
    const { maxRequests, windowMs, keyGenerator = (ctx) => `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`, onError = (ctx, retryAfter, error) => {
        ctx.setStatus = 429;
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }, } = options;
    const memoryStore = new Map();
    return async (ctx, next) => {
        const key = keyGenerator(ctx);
        let requestCount;
        let resetTime;
        for (const [key, entry] of memoryStore.entries()) {
            if (Date.now() >= entry.resetTime) {
                memoryStore.delete(key);
            }
        }
        const entry = memoryStore.get(key);
        if (entry && Date.now() < entry.resetTime) {
            requestCount = entry.count + 1;
            resetTime = entry.resetTime;
        }
        else {
            requestCount = 1;
            resetTime = Date.now() + windowMs;
            memoryStore.set(key, { count: requestCount, resetTime });
        }
        if (requestCount > maxRequests) {
            const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
            ctx.headers.set("Retry-After", retryAfter.toString());
            return onError(ctx, retryAfter, new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`));
        }
        ctx.headers.set("X-RateLimit-Limit", maxRequests.toString());
        ctx.headers.set("X-RateLimit-Remaining", (maxRequests - requestCount).toString());
        ctx.headers.set("X-RateLimit-Reset", resetTime.toString());
        return await next();
    };
};
exports.rateLimiter = rateLimiter;
