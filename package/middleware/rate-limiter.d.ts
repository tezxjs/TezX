import { Context } from "../index.js";
import { HttpBaseResponse, Middleware } from "../types/index.js";
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
        get: (key: string) => {
            count: number;
            resetTime: number;
        } | undefined;
        set: (key: string, value: {
            count: number;
            resetTime: number;
        }) => void;
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
declare const rateLimiter: <T extends Record<string, any> = {}, Path extends string = any>(options: RateLimiterOptions) => Middleware<T, Path>;
export { rateLimiter as default, rateLimiter };
