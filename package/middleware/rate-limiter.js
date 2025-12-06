import { getConnInfo } from "../helper/index.js";
import { createRateLimitDefaultStorage, isRateLimit } from "../utils/rateLimit.js";
const rateLimiter = (options) => {
    const { maxRequests, windowMs, keyGenerator = (ctx) => {
        const xForwardedFor = ctx.req.header("x-forwarded-for");
        if (xForwardedFor) {
            const ip = xForwardedFor.split(",")[0].trim();
            return ip;
        }
        const clientIp = ctx.req.header("client-ip");
        if (clientIp)
            return clientIp;
        const { port, address } = getConnInfo(ctx) ?? {};
        return `${address}:${port}`;
    }, storage = createRateLimitDefaultStorage(), onError = (ctx, retryAfter, error) => {
        ctx.status(429);
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }, } = options;
    return async function rateLimiter(ctx, next) {
        const key = keyGenerator(ctx);
        const { check, entry } = isRateLimit(key, storage, maxRequests, windowMs);
        if (check) {
            const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
            ctx.headers.set("Retry-After", retryAfter.toString());
            return onError(ctx, retryAfter, new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`));
        }
        ctx.headers.set("X-RateLimit-Limit", maxRequests.toString());
        ctx.headers.set("X-RateLimit-Remaining", (maxRequests - entry.count).toString());
        ctx.headers.set("X-RateLimit-Reset", entry.resetTime.toString());
        return await next();
    };
};
export { rateLimiter as default, rateLimiter };
