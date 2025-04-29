"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const detectBot_js_1 = require("./detectBot.js");
const rateLimiter = (options) => {
  const {
    maxRequests,
    windowMs,
    keyGenerator = (ctx) =>
      `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`,
    storage = (0, detectBot_js_1.createRateLimitDefaultStorage)(),
    onError = (ctx, retryAfter, error) => {
      ctx.setStatus = 429;
      throw new Error(
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      );
    },
  } = options;
  return async (ctx, next) => {
    const key = keyGenerator(ctx);
    const { check, entry } = (0, detectBot_js_1.isRateLimit)(
      ctx,
      key,
      storage,
      maxRequests,
      windowMs,
    );
    if (check) {
      const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
      ctx.headers.set("Retry-After", retryAfter.toString());
      return onError(
        ctx,
        retryAfter,
        new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`),
      );
    }
    ctx.headers.set("X-RateLimit-Limit", maxRequests.toString());
    ctx.headers.set(
      "X-RateLimit-Remaining",
      (maxRequests - entry.count).toString(),
    );
    ctx.headers.set("X-RateLimit-Reset", entry.resetTime.toString());
    return await next();
  };
};
exports.rateLimiter = rateLimiter;
