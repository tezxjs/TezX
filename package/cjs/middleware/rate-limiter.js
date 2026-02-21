"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.default = void 0;
const index_js_1 = require("../helper/index.js");
const rateLimit_js_1 = require("../utils/rateLimit.js");
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
        const { port, address } = (0, index_js_1.getConnInfo)(ctx) ?? {};
        return `${address}:${port}`;
    }, storage = (0, rateLimit_js_1.createRateLimitDefaultStorage)(), onError = (ctx, retryAfter, error) => {
        ctx.status(429);
        throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    }, } = options;
    return async function rateLimiter(ctx, next) {
        const key = keyGenerator(ctx);
        const { check, entry } = (0, rateLimit_js_1.isRateLimit)(key, storage, maxRequests, windowMs);
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
exports.default = rateLimiter;
exports.rateLimiter = rateLimiter;
