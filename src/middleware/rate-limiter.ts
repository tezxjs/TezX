import { getConnInfo } from "../helper/index.js";
import { Context } from "../index.js";
import { Ctx, HttpBaseResponse, Middleware } from "../types/index.js";
import { createRateLimitDefaultStorage, isRateLimit } from "../utils/rateLimit.js";

export type RateLimiterOptions = {
  /**
   * 🔴 Maximum allowed requests in the time window
   * @example
   * maxRequests: 100 // Allow 100 requests per window
   */
  maxRequests: number;

  /**
   * 🕒 Time window in milliseconds
   * @example
   * windowMs: 60_000 // 1 minute window
   */
  windowMs: number;

  /**
   * 🔑 Function to generate a client identifier for rate-limiting.
   * By default, it uses `X-Forwarded-For`, `Client-IP`, or `getConnInfo(ctx)`.
   * @example
   * keyGenerator: (ctx) => ctx.user?.id || ctx.ip
   */
  keyGenerator?: (ctx: Context) => string;

  /**
   * 🔄 Custom cache/storage implementation.
   * Must provide `get`, `set`, and `clearExpired` methods.
   * @default In-memory Map via `createRateLimitDefaultStorage()`
   */
  storage?: {
    get: (key: string) => { count: number; resetTime: number } | undefined;
    set: (key: string, value: { count: number; resetTime: number }) => void;
    clearExpired: () => void;
  };

  /**
   * 🛑 Custom handler when rate limit is exceeded.
   * @default Throws 429 status with Retry-After header
   */
  onError?: (ctx: Context, retryAfter: number, error: Error) => HttpBaseResponse;
};

/**
 * 🚦 Rate Limiter Middleware
 *
 * Throttles requests per client based on a sliding window.
 * Supports custom client identification and storage backends.
 *
 * Client IP detection uses (in order):
 * 1. `X-Forwarded-For` header
 * 2. `Client-IP` header
 * 3. `getConnInfo(ctx)` fallback
 *
 * ```ts
 * import { getConnInfo } from "tezx/helper";
 * ```
 *
 * @param options RateLimiterOptions
 * @returns Middleware function
 *
 * @example
 * // Basic rate limiting (100 requests/minute)
 * app.use(rateLimiter({ maxRequests: 100, windowMs: 60_000 }));
 *
 * // Custom client identification
 * app.use(rateLimiter({
 *   maxRequests: 10,
 *   windowMs: 10_000,
 *   keyGenerator: (ctx) => ctx.user?.id
 * }));
 */

const rateLimiter = <T extends Record<string, any> = {}, Path extends string = any>(options: RateLimiterOptions): Middleware<T, Path> => {
  const {
    maxRequests,
    windowMs,
    keyGenerator = (ctx: Ctx) => {
      // প্রথমে x-forwarded-for header চেক করুন
      const xForwardedFor = ctx.req.header("x-forwarded-for");
      if (xForwardedFor) {
        const ip = xForwardedFor.split(",")[0].trim();
        return ip;
      }
      const clientIp = ctx.req.header("client-ip");
      if (clientIp) return clientIp;
      const { port, address } = getConnInfo(ctx) ?? {};
      return `${address}:${port}`;
    },
    storage = createRateLimitDefaultStorage(),
    onError = (ctx, retryAfter, error) => {
      ctx.status(429); // Too Many Requests
      throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
    },
  } = options;

  return async function rateLimiter(ctx, next) {
    const key = keyGenerator(ctx);
    const { check, entry } = isRateLimit(key, storage, maxRequests, windowMs);
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

export { rateLimiter as default, rateLimiter };

