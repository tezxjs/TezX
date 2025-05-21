import { Context, Middleware } from "../index.js";
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
export declare const cacheControl: (options: CacheOptions) => Middleware;
