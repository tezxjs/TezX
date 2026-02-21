import { getConnInfo } from "../helper/index.js";
import { createRateLimitDefaultStorage, isRateLimit } from "../utils/rateLimit.js";
export const detectBot = (opts = {}) => {
    const botUAs = opts.botUserAgents || ["bot", "spider", "crawl", "slurp"];
    let checkBot;
    const botRegex = new RegExp(botUAs.join("|"), "i");
    checkBot = (ua) => botRegex.test(ua);
    const keyGenerator = opts.keyGenerator ?? ((ctx) => {
        const addr = getConnInfo(ctx);
        return addr ? `${addr.address}:${addr.port}` : "unknown";
    });
    const maxReq = opts.maxRequests || 30;
    const winMs = opts.windowMs || 60000;
    const enableRL = !!opts.enableRateLimiting;
    const onBot = opts.onBotDetected ??
        ((ctx, reason) => ctx.status(403).json({ error: `Bot detected: ${reason}` }));
    let store = opts.storage;
    if (enableRL && !store)
        store = createRateLimitDefaultStorage();
    return async (ctx, next) => {
        const ua = ctx.headers.get("user-agent") || "";
        if (checkBot(ua)) {
            return onBot?.(ctx, "User-Agent");
        }
        if (await opts?.isBlacklisted?.(ctx)) {
            return onBot?.(ctx, "Blacklisted IP");
        }
        if (enableRL) {
            const key = keyGenerator(ctx);
            if (!key) {
                return onBot?.(ctx, "Unable to determine client identity for rate limiting");
            }
            const { check, entry } = isRateLimit(key, store, maxReq, winMs);
            if (check) {
                return onBot?.(ctx, `Rate limit exceeded. Retry after ${Math.ceil((entry.resetTime - Date.now()) / 1000)} seconds.`);
            }
        }
        if (await opts.customBotDetector?.(ctx)) {
            return onBot?.(ctx, "Custom Detector");
        }
        return await next();
    };
};
