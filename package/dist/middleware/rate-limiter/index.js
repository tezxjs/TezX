import { createRateLimitDefaultStorage, isRateLimit } from "../../utils/rateLimit.js";
export const rateLimiter = (options) => {
    const { maxRequests, windowMs, keyGenerator = (ctx) => `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`, storage = createRateLimitDefaultStorage(), onError = (ctx, retryAfter, error) => {
        ctx.setStatus = 429;
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }, } = options;
    return async function rateLimiter(ctx, next) {
        const key = keyGenerator(ctx);
        const { check, entry } = isRateLimit(ctx, key, storage, maxRequests, windowMs);
        if (check) {
            const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
            ctx.setHeader("Retry-After", retryAfter.toString());
            return onError(ctx, retryAfter, new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`));
        }
        ctx.setHeader("X-RateLimit-Limit", maxRequests.toString());
        ctx.setHeader("X-RateLimit-Remaining", (maxRequests - entry.count).toString());
        ctx.setHeader("X-RateLimit-Reset", entry.resetTime.toString());
        return await next();
    };
};
