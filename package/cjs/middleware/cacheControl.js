"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheControl = void 0;
const config_js_1 = require("../core/config.js");
const cacheControl = (options) => {
    const { defaultSettings, useWeakETag = false, rules = [], logEvent = (event, ctx, error) => {
        if (event === "error") {
            config_js_1.GlobalConfig.debugging.error(`[CACHE] ${event.toUpperCase()}: ${error?.message}`);
        }
        else {
            config_js_1.GlobalConfig.debugging.success(`[CACHE] ${event.toUpperCase()} for ${ctx.method} ${ctx.pathname}`);
        }
    }, } = options;
    return async function cacheControl(ctx, next) {
        if (!["GET", "HEAD"].includes(ctx.method)) {
            return await next();
        }
        try {
            await next();
            const matchedRule = rules.find((rule) => rule.condition(ctx)) || null;
            const { maxAge, scope, enableETag, vary } = matchedRule || defaultSettings;
            const cacheControlValue = `${scope}, max-age=${maxAge}`;
            ctx.header("Cache-Control", cacheControlValue);
            const expiresDate = new Date(Date.now() + maxAge * 1000).toUTCString();
            ctx.header("Expires", expiresDate);
            if (vary?.length) {
                ctx.header("Vary", vary.join(", "));
            }
            if (enableETag) {
                const responseBody = typeof ctx.resBody === "string"
                    ? ctx.resBody
                    : JSON.stringify(ctx.resBody ?? "");
                const etag = await generateETag(responseBody, useWeakETag);
                const ifNoneMatch = ctx.req.headers.get("if-none-match");
                if (ifNoneMatch === etag) {
                    ctx.setStatus = 304;
                    ctx.body = null;
                    logEvent("cached", ctx);
                    return;
                }
                ctx.header("ETag", etag);
            }
            logEvent("cached", ctx);
        }
        catch (error) {
            logEvent("error", ctx, error);
            ctx.setStatus = 500;
            ctx.body = { error: "Failed to set cache headers." };
        }
    };
};
exports.cacheControl = cacheControl;
const generateETag = async (content, weak = false) => {
    const crypto = await Promise.resolve().then(() => require("node:crypto"));
    const hash = crypto.createHash("md5").update(content).digest("hex");
    return weak ? `W/"${hash}"` : `"${hash}"`;
};
