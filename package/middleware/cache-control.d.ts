import { Context } from "../core/context.js";
import { HttpBaseResponse, Middleware } from "../types/index.js";
export type CacheRule = {
    /**
     * 🎯 Condition to determine if this rule applies.
     */
    condition: (ctx: Context) => boolean;
    /**
     * ⏳ Maximum age (in seconds) for caching.
     */
    maxAge: number;
    /**
     * 🌐 Cache scope: "public" or "private".
     */
    scope: "public" | "private";
    /**
     * 🔄 Enable or disable revalidation with ETag.
     */
    enableETag: boolean;
    /**
     * 🏷️ Vary header for cache variations.
     */
    vary?: string[];
};
export type CacheSettings = Pick<CacheRule, "maxAge" | "scope" | "enableETag" | "vary">;
export type CacheOptions = {
    /**
     * 🧪 Weak ETag generation (optional).
     */
    useWeakETag?: boolean;
    /**
     * Error handler for cache middleware.
     * @param error - The error that occurred.
     * @param ctx - The current request context.
     * @returns An HTTP response to send when an error occurs.
     */
    onError?: (error: Error, ctx: Context) => HttpBaseResponse;
    /**
     * 📝 Logging function for cache events.
     */
    logEvent?: (event: "cached" | "no-cache" | "error", ctx: Context, error?: Error) => void;
    /**
     * 🛠️ Default cache settings.
     */
    defaultSettings: CacheSettings;
    /**
     * 🔧 Custom rules for dynamic caching behavior.
     */
    rules?: CacheRule[];
};
/**
 * Middleware to manage HTTP caching headers dynamically.
 * @param options - Custom options for dynamic caching behavior.
 */
declare const cacheControl: (options: CacheOptions) => Middleware;
export { cacheControl, cacheControl as default };
