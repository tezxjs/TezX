import { GlobalConfig } from "../../core/config.js";
import { Context, Middleware } from "../../index.js";
import { HttpBaseResponse } from "../../types/index.js";
import { createRateLimitDefaultStorage, isRateLimit } from "../../utils/rateLimit.js";

export type DetectBotReason =
    | "User-Agent"
    | "Blacklisted IP"
    | "Query Parameter"
    | "Rate Limiting"
    | "Custom Detector"
    | "Multiple Indicators";

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
    isBlacklisted?: (
        ctx: Context,
        remoteAddress: string,
    ) => boolean | Promise<boolean>;

    /**
     * 🔍 Query parameter name for bot identification
     * @default "bot"
     */
    queryKeyBot?: string;

    /**
     * 🛡️ Action to take when bot is detected
     * @default "block"
     */
    onBotDetected?:
    | "block"
    | ((ctx: Context, result: BotDetectionResult) => HttpBaseResponse);

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
    customBlockedResponse?: (
        ctx: Context,
        result: BotDetectionResult,
    ) => HttpBaseResponse;

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
     * 📊 Minimum confidence score to consider as bot (0-1)
     * @default 0.5
     */
    confidenceThreshold?: number;
};

/**
 * 🤖 Advanced bot detection middleware with multiple detection methods
 * @requires 
 * 
```ts
  import { getConnInfo } from "tezx/bun";
  // or
  import { getConnInfo } from "tezx/deno";
  // or
  import { getConnInfo } from "tezx/node";
```
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
export const detectBot = (options: DetectBotOptions = {}): Middleware => {
    const {
        botUserAgents = ["bot", "spider", "crawl", "slurp"],
        maxRequests = 30,
        windowMs = 60000,
        isBlacklisted = async () => false,
        queryKeyBot = "bot",
        onBotDetected = "block",
        enableRateLimiting = false,
        customBotDetector = async () => false,
        customBlockedResponse = (ctx, { reason }) => {
            ctx.setStatus = 403;
            return ctx.json({ error: `Bot detected: ${reason}` });
        },
        storage,
        confidenceThreshold = 0.5,
    } = options;

    let store: any = storage;
    if (enableRateLimiting) {
        store = createRateLimitDefaultStorage();
    }

    return async function detectBot(ctx, next) {
        const detectionResult: BotDetectionResult = {
            isBot: false,
            indicators: [],
        };

        // 1. 🕵️ Collect detection data
        const userAgent = ctx.headers.get("user-agent")?.toLowerCase() || "";
        const remoteAddress =
            `${ctx.req.remoteAddress?.address}:${ctx.req.remoteAddress?.port}` ||
            "unknown";
        const isBotQuery = ctx.req.query[queryKeyBot] === "true";

        // 2. 🔍 Run detection checks
        // User-Agent check
        if (botUserAgents.some((agent) => userAgent.includes(agent))) {
            detectionResult.indicators.push("User-Agent");
        }

        // IP blacklist check
        if (await isBlacklisted(ctx, remoteAddress)) {
            detectionResult.indicators.push("Blacklisted IP");
        }

        // Query parameter check
        if (isBotQuery) {
            detectionResult.indicators.push("Query Parameter");
        }

        const key = `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`;
        // Rate limiting check
        if (
            enableRateLimiting &&
            isRateLimit(ctx, key, store, maxRequests, windowMs).check
        ) {
            detectionResult.indicators.push("Rate Limiting");
        }

        // Custom detection
        if (await customBotDetector(ctx)) {
            detectionResult.indicators.push("Custom Detector");
        }

        // 3. 🎯 Determine final bot status
        detectionResult.isBot = detectionResult.indicators.length > 0;

        // Apply confidence threshold if multiple indicators
        if (detectionResult.indicators.length > 1) {
            detectionResult.reason = "Multiple Indicators";
            const confidence = Math.min(0.3 * detectionResult.indicators.length, 1);
            detectionResult.isBot = confidence >= confidenceThreshold;
        } else if (detectionResult.indicators.length === 1) {
            detectionResult.reason = detectionResult.indicators[0] as DetectBotReason;
        }

        // 4. 🛡️ Handle bot detection
        if (detectionResult.isBot) {
            GlobalConfig.debugging.warn(`Bot detected: ${detectionResult.reason}`, {
                ip: remoteAddress,
                userAgent,
                indicators: detectionResult.indicators,
            });

            if (onBotDetected === "block") {
                return customBlockedResponse(ctx, detectionResult);
            } else if (typeof onBotDetected === "function") {
                return onBotDetected(ctx, detectionResult);
            }
        }

        // 5. ⏭️ Proceed if not bot or configured to allow
        return await next();
    };
};

