import { Context, Middleware } from "../index.js";
import { HttpBaseResponse } from "../types/index.js";
/**
 * ⚙️ Configuration options for the `detectBot` middleware.
 */
export type DetectBotOptions = {
    /**
     * 🤖 List of known bot-like User-Agent patterns.
     * @default ["bot", "spider", "crawl", "slurp"]
     * @example
     * botUserAgents: ["bot", "crawler", "indexer"]
     */
    botUserAgents?: string[];
    /**
     * ⚖️ Enable rate-limiting based bot detection.
     * Requires `getConnInfo()` import from TezX runtime.
     * @default false
     * @example
     * enableRateLimiting: true
     */
    enableRateLimiting?: boolean;
    /**
     * 🔑 Client identifier generator function for rate limit
     * @default (ctx) => `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`
     * @example
     * keyGenerator: (ctx) => ctx.user?.id || ctx.ip // Use user ID if authenticated
     */
    keyGenerator?: (ctx: Context) => string;
    /**
     * ⚠️ Maximum allowed requests in the rate-limit window.
     * Only used when `enableRateLimiting` is true.
     * @default 30
     */
    maxRequests?: number;
    /**
     * ⏱️ Time window for rate-limiting (in milliseconds).
     * @default 60000 (1 minute)
     */
    windowMs?: number;
    /**
     * 🔄 Custom rate-limit storage implementation.
     * Allows integration with Redis, Memcached, or in-memory stores.
     * @default In-memory Map
     * @example
     * storage: {
     *   get: (key) => myRedisClient.get(key),
     *   set: (key, value) => myRedisClient.set(key, value),
     *   clearExpired: () => {}
     * }
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
     * 🚫 Optional IP blacklist checker.
     * Should return true if the current request’s IP is banned or suspicious.
     * @default () => false
     * @example
     * isBlacklisted: (ctx) => ctx.req.remoteAddress.address === "192.168.0.10"
     */
    isBlacklisted?: (ctx: Context) => boolean | Promise<boolean>;
    /**
     * 🧠 Custom bot detector function.
     * Use this for advanced heuristics (e.g., suspicious query params or headers).
     * @example
     * customBotDetector: (ctx) => ctx.query?.token === "weird"
     */
    customBotDetector?: (ctx: Context) => boolean | Promise<boolean>;
    /**
     * 🛡️ Action executed when a bot is detected.
     * Can return a custom HTTP response (e.g., JSON, HTML, or redirect).
     * @default Responds with 403 and JSON error.
     * @example
     * onBotDetected: (ctx, reason) => ctx.status(403).json({ error: `Blocked: ${reason}` })
     */
    onBotDetected?: (ctx: Context, reason: string) => HttpBaseResponse;
};
/**
 * 🤖 Smart Bot Detection Middleware
 *
 * Detects automated or malicious requests using a combination of:
 * - User-Agent analysis
 * - IP blacklisting
 * - Rate limiting
 * - Custom detection logic
 *
 * 🧩 Supports:
 * - Bun (uses precompiled RegExp for speed)
 * - Node.js / Deno (optimized `includes()` loop)
 *
 * ⚙️ Requirements (for rate limiting):
 * You must import `getConnInfo` from your runtime adapter:
 * ```ts
 * import { getConnInfo } from "tezx/bun";
 * // or
 * import { getConnInfo } from "tezx/node";
 * // or
 * import { getConnInfo } from "tezx/deno";
 * ```
 *
 * 📦 Example Usage:
 * ```ts
 * import { detectBot } from "tezx/middleware/detectBot";
 *
 * app.use(detectBot({
 *   enableRateLimiting: true,
 *   botUserAgents: ["bot", "crawler"],
 *   onBotDetected: (ctx, reason) => ctx.status(403).json({ error: `Bot detected: ${reason}` })
 * }));
 * ```
 */
export declare const detectBot: <T extends Record<string, any> = {}, Path extends string = any>(opts?: DetectBotOptions) => Middleware<T, Path>;
