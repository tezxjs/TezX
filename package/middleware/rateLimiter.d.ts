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
     * 🛑 Custom rate limit exceeded handler
     * @default Sends 429 status with Retry-After header
     * @example
     * onError: (ctx, retryAfter) => {
     *   ctx.status = 429;
     *   ctx.body = { error: `Try again in ${retryAfter} seconds` };
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
