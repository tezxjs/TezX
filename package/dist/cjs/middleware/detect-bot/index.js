"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectBot = void 0;
const config_js_1 = require("../../core/config.js");
const rateLimit_js_1 = require("../../utils/rateLimit.js");
const detectBot = (options = {}) => {
    const { botUserAgents = ["bot", "spider", "crawl", "slurp"], maxRequests = 30, windowMs = 60000, isBlacklisted = async () => false, queryKeyBot = "bot", onBotDetected = "block", enableRateLimiting = false, customBotDetector = async () => false, customBlockedResponse = (ctx, { reason }) => {
        ctx.setStatus = 403;
        return ctx.json({ error: `Bot detected: ${reason}` });
    }, storage, confidenceThreshold = 0.5, } = options;
    let store = storage;
    if (enableRateLimiting) {
        store = (0, rateLimit_js_1.createRateLimitDefaultStorage)();
    }
    return async function detectBot(ctx, next) {
        const detectionResult = {
            isBot: false,
            indicators: [],
        };
        const userAgent = ctx.headers.get("user-agent")?.toLowerCase() || "";
        const remoteAddress = `${ctx.req.remoteAddress?.address}:${ctx.req.remoteAddress?.port}` ||
            "unknown";
        const isBotQuery = ctx.req.query[queryKeyBot] === "true";
        if (botUserAgents.some((agent) => userAgent.includes(agent))) {
            detectionResult.indicators.push("User-Agent");
        }
        if (await isBlacklisted(ctx, remoteAddress)) {
            detectionResult.indicators.push("Blacklisted IP");
        }
        if (isBotQuery) {
            detectionResult.indicators.push("Query Parameter");
        }
        const key = `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`;
        if (enableRateLimiting &&
            (0, rateLimit_js_1.isRateLimit)(ctx, key, store, maxRequests, windowMs).check) {
            detectionResult.indicators.push("Rate Limiting");
        }
        if (await customBotDetector(ctx)) {
            detectionResult.indicators.push("Custom Detector");
        }
        detectionResult.isBot = detectionResult.indicators.length > 0;
        if (detectionResult.indicators.length > 1) {
            detectionResult.reason = "Multiple Indicators";
            const confidence = Math.min(0.3 * detectionResult.indicators.length, 1);
            detectionResult.isBot = confidence >= confidenceThreshold;
        }
        else if (detectionResult.indicators.length === 1) {
            detectionResult.reason = detectionResult.indicators[0];
        }
        if (detectionResult.isBot) {
            config_js_1.GlobalConfig.debugging.warn(`Bot detected: ${detectionResult.reason}`, {
                ip: remoteAddress,
                userAgent,
                indicators: detectionResult.indicators,
            });
            if (onBotDetected === "block") {
                return customBlockedResponse(ctx, detectionResult);
            }
            else if (typeof onBotDetected === "function") {
                return onBotDetected(ctx, detectionResult);
            }
        }
        return await next();
    };
};
exports.detectBot = detectBot;
