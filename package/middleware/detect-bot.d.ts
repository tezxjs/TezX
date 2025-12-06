import { Context, Middleware } from "../index.js";
import { HttpBaseResponse } from "../types/index.js";
/**
 * ⚙️ Configuration options for the `detectBot` middleware.
 */
export type DetectBotOptions = {
    /**
     * 🤖 List of known bot-like User-Agent patterns.
     * Middleware will block requests whose User-Agent matches any of these patterns.
     * @default ["bot", "spider", "crawl", "slurp"]
     * @example
     * botUserAgents: ["bot", "crawler", "indexer"]
     */
    botUserAgents?: string[];
    /**
     * ⚖️ Enable rate-limiting based bot detection.
     * Middleware will track requests per client and block if exceeding limits.
     * @default false
     */
    enableRateLimiting?: boolean;
    /**
     * 🔑 Function to generate a client identifier for rate-limiting.
     * By default, it uses the client's IP and port via `getConnInfo`.
     * @example
     * keyGenerator: (ctx) => ctx.user?.id || ctx.ip
     */
    keyGenerator?: (ctx: Context) => string;
    /**
     * ⚠️ Maximum allowed requests in the rate-limit window.
     * Only used if `enableRateLimiting` is true.
     * @default 30
     */
    maxRequests?: number;
    /**
     * ⏱️ Time window for rate-limiting in milliseconds.
     * @default 60000 (1 minute)
     */
    windowMs?: number;
    /**
     * 🔄 Custom rate-limit storage implementation.
     * Can integrate with Redis, Memcached, or an in-memory store.
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
     * Return true to block a specific IP.
     * @default () => false
     */
    isBlacklisted?: (ctx: Context) => boolean | Promise<boolean>;
    /**
     * 🧠 Custom bot detector function.
     * Return true to block the request based on custom logic.
     */
    customBotDetector?: (ctx: Context) => boolean | Promise<boolean>;
    /**
     * 🛡️ Callback executed when a bot is detected.
     * Can return a custom HTTP response (JSON, HTML, redirect, etc.).
     * @default Responds with 403 and JSON error.
     */
    onBotDetected?: (ctx: Context, reason: string) => HttpBaseResponse;
};
/**
 * 🤖 Smart Bot Detection Middleware
 *
 * Detects automated or malicious requests using multiple strategies:
 * - User-Agent analysis
 * - IP blacklist
 * - Rate-limiting per client
 * - Custom bot detection
 *
 * The client identity for rate-limiting is determined via `getConnInfo(ctx)`,
 * which returns the connection info:
 * ```ts
 * {
 *   address: string;   // IP address of the client
 *   port?: number;     // Port number of the client
 *   transport?: string;// Transport protocol (tcp, udp)
 * }
 * ```
 *
 * 📦 Example Usage:
 * ```ts
 * import { detectBot } from "tezx/middleware";
 *
 * app.use(detectBot({
 *   enableRateLimiting: true,
 *   botUserAgents: ["bot", "crawler"],
 *   onBotDetected: (ctx, reason) => ctx.status(403).json({ error: `Bot detected: ${reason}` })
 * }));
 * ```
 */
export declare const detectBot: <T extends Record<string, any> = {}, Path extends string = any>(opts?: DetectBotOptions) => Middleware<T, Path>;
