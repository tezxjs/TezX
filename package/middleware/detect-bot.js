import { GlobalConfig } from "../core/config.js";
import { createRateLimitDefaultStorage, isRateLimit, } from "../utils/rateLimit.js";
import { runtime } from "../utils/runtime.js";
export const detectBot = (opts = {}) => {
    const botUAs = opts.botUserAgents || ["bot", "spider", "crawl", "slurp"];
    let checkBot;
    if (runtime === "bun") {
        const botRegex = new RegExp(botUAs.join("|"), "i");
        checkBot = (ua) => botRegex.test(ua);
    }
    else {
        checkBot = (ua) => {
            for (const b of botUAs)
                if (ua.includes(b))
                    return true;
            return false;
        };
    }
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
            const addr = ctx.req.remoteAddress;
            if (!addr) {
                GlobalConfig.debugging.warn("[TezX detectBot] Missing remoteAddress. Use `getConnInfo(ctx)` to enable rate limiting.");
            }
            else {
                const key = `${addr.address}:${addr.port || 0}`;
                const { check, entry } = isRateLimit(key, store, maxReq, winMs);
                if (check && addr.address) {
                    return onBot?.(ctx, `Rate limit exceeded. Retry after ${Math.ceil((entry.resetTime - Date.now()) / 1000)} seconds.`);
                }
            }
        }
        if (await opts.customBotDetector?.(ctx)) {
            return onBot?.(ctx, "Custom Detector");
        }
        return await next();
    };
};
