"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    const crypto = await Promise.resolve().then(() => __importStar(require("node:crypto")));
    const hash = crypto.createHash("md5").update(content).digest("hex");
    return weak ? `W/"${hash}"` : `"${hash}"`;
};
