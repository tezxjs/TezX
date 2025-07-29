import { Context } from "../../core/context.js";
import { HttpBaseResponse, Middleware } from "../../types/index.js";
import { createRateLimitDefaultStorage, isRateLimit } from "../../utils/rateLimit.js";

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
     * 🔑 Client identifier generator function
     * @default (ctx) => `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`
     * @example
     * keyGenerator: (ctx) => ctx.user?.id || ctx.ip // Use user ID if authenticated
     */
    keyGenerator?: (ctx: Context) => string;

    /**
      //  * ⚠️ (Future) Storage backend - currently memory only
      //  * @todo Implement Redis storage
      //  */
    // storage?: "memory" | "redis";

    // /**
    //  * 🟠 Redis client instance (required if using Redis)
    //  * @todo Implement Redis support
    //  */
    // redisClient?: any;

    /**
     * 🔄 Custom cache storage implementation (e.g., using `Map`, `Redis`, etc.).
     * By default, it uses a `Map<string, { count: number; resetTime: number }>`.
     */
    storage?: {
        get: (key: string) => { count: number; resetTime: number } | undefined;
        set: (key: string, value: { count: number; resetTime: number }) => void;
        clearExpired: () => void;
    };

    /**
     * 🛑 Custom rate limit exceeded handler
     * @default Sends 429 status with Retry-After header
     * @example
     * onError: (ctx, retryAfter) => {
     *   ctx.status = 429;
     *   throw new Error( `Rate limit exceeded. Try again in ${retryAfter} seconds.`);
     * }
     */
    onError?: (ctx: Context, retryAfter: number, error: Error) => HttpBaseResponse;
};

/**
 * 🚦 Rate limiting middleware for request throttling
 *
 * Enforces maximum request limits per client with sliding window.
 * Currently supports in-memory storage only (Redis coming soon).
 * @requires
 *  * 
```ts
  import { getConnInfo } from "tezx/bun";
  // or
  import { getConnInfo } from "tezx/deno";
  // or
  import { getConnInfo } from "tezx/node";
```
 * @param {RateLimiterOptions} options - Configuration
 * @returns {Middleware} Middleware function
 *
 * @example
 * // Basic rate limiting (100 requests/minute)
 * app.use(rateLimiter({
 *   maxRequests: 100,
 *   windowMs: 60_000
 * }));
 *
 * // Custom client identification
 * app.use(rateLimiter({
 *   maxRequests: 10,
 *   windowMs: 10_000,
 *   keyGenerator: (ctx) => ctx.user?.id || ctx.ip
 * }));
 */

export const rateLimiter = (options: RateLimiterOptions): Middleware => {
    const {
        maxRequests,
        windowMs,
        keyGenerator = (ctx) =>
            `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`,
        storage = createRateLimitDefaultStorage(),
        // redisClient,
        onError = (ctx, retryAfter, error) => {
            ctx.setStatus = 429; // Too Many Requests
            throw new Error(
                `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            );
        },
    } = options;

    return async function rateLimiter(ctx, next) {
        // Generate a unique key for the client
        const key = keyGenerator(ctx);
        const { check, entry } = isRateLimit(
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

        // Proceed to the next middleware
        return await next();
    };
};
