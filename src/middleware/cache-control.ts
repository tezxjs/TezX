import { Context } from "../index.js";
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

export interface CacheSettings
  extends Pick<CacheRule, "maxAge" | "scope" | "vary"> { }

export interface CacheOptions {
  /** 🧱 Default cache behavior */
  defaultSettings: CacheSettings;
  /** 🔧 Optional rules for dynamic caching */
  rules?: readonly CacheRule[];
  /** 📝 Logging hook */
  /** 🚨 Error handler */
  onError?: (error: Error, ctx: Context) => HttpBaseResponse;
}

/**
 * ⚡ Ultra-lightweight, low-level cache control middleware.
 * Adds 'Cache-Control', 'Expires', and optional 'Vary' headers.
 */
export const cacheControl = <T extends Record<string, any> = {}, Path extends string = any>(opts: CacheOptions): Middleware<T, Path> => {
  const {
    defaultSettings,
    rules = [],
    // logEvent,
    onError = (err, ctx) => {
      ctx.status(500).body = { error: err.message ?? "Cache middleware failed" };
    },
  } = opts;
  const len = rules.length | 0; // bitwise coercion to int (slightly faster access)
  // const hasLogger = typeof logEvent === "function";

  return async function cacheControlMiddleware(ctx, next) {
    // 🧠 Only apply for cacheable methods
    const method = ctx.method;
    if (method !== "GET" && method !== "HEAD") {
      return await next();
    }

    try {
      await next();
      // 🎯 Determine the matching rule (manual loop faster than .find)
      let matched: CacheRule | undefined;
      for (let i = 0; i < len; i++) {
        const rule = rules[i];
        if (rule.condition(ctx)) {
          matched = rule;
          break;
        }
      }

      // 🧱 Select settings
      const settings = matched ?? defaultSettings;
      const maxAge = settings.maxAge;
      const scope = settings.scope;
      const vary = settings.vary;

      // 🚀 Precompute strings (avoid repeated template creation)
      const cacheValue = `${scope}, max-age=${maxAge}`;
      const expiresValue = new Date(Date.now() + maxAge * 1000).toUTCString();
      // ⚙️ Set headers directly (no mutation of ctx.headers object if unnecessary)
      const headers = ctx.headers;
      headers.set("Cache-Control", cacheValue);
      headers.set("Expires", expiresValue);
      if (vary && vary.length > 0) headers.set("Vary", vary.join(", "));
      // if (hasLogger) logEvent!("cached", ctx);
    }
    catch (err) {
      let error = err instanceof Error ? err : new Error(err as any);
      return onError(error, ctx);
    }
  };
};

export default cacheControl;
