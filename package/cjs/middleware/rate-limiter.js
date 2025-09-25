"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.rateLimiter = void 0;
const error_js_1 = require("../core/error.js");
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
        const addr = ctx.req.remoteAddress?.address || "unknown";
        const port = ctx.req.remoteAddress?.port || "0";
        return `${addr}:${port}`;
    }, storage = (0, rateLimit_js_1.createRateLimitDefaultStorage)(), onError = (ctx, retryAfter, error) => {
        ctx.setStatus = 429;
        throw new error_js_1.TezXError(`Rate limit exceeded. Try again in ${retryAfter} seconds.`, 429);
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
exports.rateLimiter = rateLimiter;
exports.default = rateLimiter;
