import { CallbackReturn } from "../core/router.js";
import { Context, Middleware } from "../index.js";
export type DetectBotReason = "User-Agent" | "Blacklisted IP" | "Query Parameter" | "Rate Limiting" | "Custom Detector" | "Multiple Indicators";
export type BotDetectionResult = {
    isBot: boolean;
    reason?: DetectBotReason;
    indicators: string[];
};
export type DetectBotOptions = {
    /**
     * 🤖 List of bot-like user-agent substrings to detect
     * @default ["bot", "spider", "crawl", "slurp"]
     */
    botUserAgents?: string[];
    /**
     * ⚠️ Maximum allowed requests in the time window
     * @default 30 requests
     */
    maxRequests?: number;
    /**
     * ⏱️ Time window in milliseconds for rate limiting
     * @default 60000 (1 minute)
     */
    windowMs?: number;
    /**
     * 🚫 IP blacklist checker
     * @default () => false
     */
    isBlacklisted?: (ctx: Context, remoteAddress: string) => boolean | Promise<boolean>;
    /**
     * 🔍 Query parameter name for bot identification
     * @default "bot"
     */
    queryKeyBot?: string;
    /**
     * 🛡️ Action to take when bot is detected
     * @default "block"
     */
    onBotDetected?: "block" | ((ctx: Context, result: BotDetectionResult) => CallbackReturn);
    /**
     * ⚖️ Enable rate-limiting based detection
     * @default false
     */
    enableRateLimiting?: boolean;
    /**
     * 🔎 Custom bot detection logic
     * @default () => false
     */
    customBotDetector?: (ctx: Context) => boolean | Promise<boolean>;
    /**
     * ✉️ Custom response for blocked requests
     */
    customBlockedResponse?: (ctx: Context, result: BotDetectionResult) => CallbackReturn;
    /**
     * 🔄 Custom cache storage implementation (e.g., using `Map`, `Redis`, etc.).
     * By default, it uses a `Map<string, { count: number; resetTime: number }>`.
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
     * 📊 Minimum confidence score to consider as bot (0-1)
     * @default 0.5
     */
    confidenceThreshold?: number;
};
/**
 * 🤖 Advanced bot detection middleware with multiple detection methods
 *
 * Features:
 * - User-Agent analysis
 * - IP blacklisting
 * - Query parameter detection
 * - Rate limiting
 * - Custom detection logic
 * - Confidence-based scoring
 *
 * @param {DetectBotOptions} options - Configuration options
 * @returns {Middleware} Configured middleware
 *
 * @example
 * // Basic usage
 * app.use(detectBot());
 *
 * // Custom configuration
 * app.use(detectBot({
 *   botUserAgents: ["bot", "crawler"],
 *   isBlacklistedIP: async (ip) => await checkIPReputation(ip),
 *   onBotDetected: (ctx, { reason }) => {
 *     ctx.status = 403;
 *     return ctx.json({ error: `Bot detected (${reason})` });
 *   }
 * }));
 */
export declare const detectBot: (options?: DetectBotOptions) => Middleware;
export declare function createRateLimitDefaultStorage(): {
    get: (key: string) => {
        count: number;
        resetTime: number;
    } | undefined;
    set: (key: string, value: {
        count: number;
        resetTime: number;
    }) => Map<string, {
        count: number;
        resetTime: number;
    }>;
    clearExpired: () => void;
};
export declare function isRateLimit(ctx: Context, key: string, store: any, maxRequests: number, windowMs: number): {
    check: boolean;
    entry: any;
};
