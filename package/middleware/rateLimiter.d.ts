import { Context } from "../core/context";
import { Middleware } from "../core/router";
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
    /**
       * 🔄 Custom cache storage implementation (e.g., using `Map`, `Redis`, etc.).
       * By default, it uses a `Map<string, { count: number; resetTime: number }>`.
       */
    cacheStorage?: {
        get: (key: string) => {
            count: number;
            resetTime: number;
        } | undefined;
        set: (key: string, value: {
            count: number;
            resetTime: number;
        }) => void;
        delete: (key: string) => void;
        entries: () => IterableIterator<[string, {
            count: number;
            resetTime: number;
        }]>;
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
    onError?: (ctx: Context, retryAfter: number, error: Error) => void;
};
/**
 * 🚦 Rate limiting middleware for request throttling
 *
 * Enforces maximum request limits per client with sliding window.
 * Currently supports in-memory storage only (Redis coming soon).
 *
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
export declare const rateLimiter: (options: RateLimiterOptions) => Middleware;
