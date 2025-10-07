import { Context } from "../core/context.js";
import { TezXError } from "../core/error.js";
import { HttpBaseResponse, Middleware } from "../types/index.js";
export interface CacheRule {
    /** 🎯 Condition to determine if this rule applies */
    condition: (ctx: Context) => boolean;
    /** ⏳ Max age (seconds) */
    maxAge: number;
    /** 🌐 Cache scope */
    scope: "public" | "private";
    /** 🏷️ Vary header list */
    vary?: string[];
}
export interface CacheSettings extends Pick<CacheRule, "maxAge" | "scope" | "vary"> {
}
export interface CacheOptions {
    /** 🧱 Default cache behavior */
    defaultSettings: CacheSettings;
    /** 🔧 Optional rules for dynamic caching */
    rules?: readonly CacheRule[];
    /** 📝 Logging hook */
    /** 🚨 Error handler */
    onError?: (error: TezXError, ctx: Context) => HttpBaseResponse;
}
/**
 * ⚡ Ultra-lightweight, low-level cache control middleware.
 * Adds 'Cache-Control', 'Expires', and optional 'Vary' headers.
 */
export declare const cacheControl: (opts: CacheOptions) => Middleware;
export default cacheControl;
