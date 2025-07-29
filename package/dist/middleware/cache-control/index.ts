import { GlobalConfig } from "../../core/config.js";
import { Context } from "../../core/context.js";
import { Middleware } from "../../types/index.js";

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
    vary?: string[]; // <-- NEW
};

export type CacheSettings = Pick<
    CacheRule,
    "maxAge" | "scope" | "enableETag" | "vary"
>;

export type CacheOptions = {
    /**
     * 🧪 Weak ETag generation (optional).
     */
    useWeakETag?: boolean;

    /**
     * 📝 Logging function for cache events.
     */
    logEvent?: (
        event: "cached" | "no-cache" | "error",
        ctx: Context,
        error?: Error,
    ) => void;

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
const cacheControl = (options: CacheOptions): Middleware => {
    const {
        defaultSettings,
        useWeakETag = false,
        rules = [],
        logEvent = (event, ctx, error) => {
            if (event === "error") {
                GlobalConfig.debugging.error(
                    `[CACHE] ${event.toUpperCase()}: ${error?.message}`,
                );
            } else {
                GlobalConfig.debugging.success(
                    `[CACHE] ${event.toUpperCase()} for ${ctx.method} ${ctx.pathname}`,
                );
            }
        },
    } = options;
    return async function cacheControl(ctx, next) {
        // Proceed to the next middleware to generate the response
        if (!["GET", "HEAD"].includes(ctx.method)) {
            return await next();
        }
        try {
            await next();
            // Determine the applicable cache rule
            const matchedRule = rules.find((rule) => rule.condition(ctx)) || null;

            // Use the matched rule or default settings
            const { maxAge, scope, enableETag, vary } = matchedRule || defaultSettings;

            // Set Cache-Control header
            const cacheControlValue = `${scope}, max-age=${maxAge}`;
            ctx.setHeader("Cache-Control", cacheControlValue);

            // Set Expires header
            const expiresDate = new Date(Date.now() + maxAge * 1000).toUTCString();
            ctx.setHeader("Expires", expiresDate);
            // Set Vary header if present
            if (vary?.length) {
                ctx.setHeader("Vary", vary.join(", "));
            }
            // Set ETag for revalidation if enabled
            if (enableETag) {
                const responseBody =
                    typeof (ctx as any).resBody === "string"
                        ? (ctx as any).resBody
                        : JSON.stringify((ctx as any).resBody ?? "");

                const etag = await generateETag(responseBody, useWeakETag);

                // Check If-None-Match header for revalidation
                const ifNoneMatch = ctx.req.header("if-none-match");
                if (ifNoneMatch === etag) {
                    ctx.setStatus = 304; // Not Modified
                    ctx.body = null;
                    logEvent("cached", ctx);
                    return;
                }
                ctx.setHeader("ETag", etag);
            }
            logEvent("cached", ctx);
        }
        catch (error) {
            logEvent("error", ctx, error as Error);
            ctx.setStatus = 500;
            ctx.body = { error: "Failed to set cache headers." };
        }
    };
};

/**
 * Generates an ETag for the given content.
 * @param content - The content to hash.
 * @param weak - Whether to use a weak ETag.
 */
const generateETag = async (content: string, weak = false): Promise<string> => {
    const crypto = await import("node:crypto");
    const hash = crypto.createHash("md5").update(content).digest("hex");
    return weak ? `W/"${hash}"` : `"${hash}"`;
};

export {
    cacheControl, cacheControl as default
};