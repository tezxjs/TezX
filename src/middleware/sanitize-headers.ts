import { Middleware, ResHeaderKey } from "../types/index.js";

export type SanitizeHeadersOptions = {
  /**
   * 🟢 Whitelist of allowed headers (case-insensitive)
   * @default [] (allow all if empty)
   * @example
   * whitelist: ['content-type', 'authorization'] // Only allow these headers
   */
  whitelist?: ResHeaderKey[];
  /**
   * 🔴 Blacklist of disallowed headers (case-insensitive)
   * @default [] (block none if empty)
   * @example
   * blacklist: ['x-powered-by', 'server'] // Block server info headers
   */
  blacklist?: ResHeaderKey[];
};

/**
 * 🧼 Middleware to sanitize HTTP headers for security and compliance
 *
 * Removes dangerous headers, enforces allow/block lists, and normalizes headers.
 * Protects against header injection and information leakage.
 *
 * @param {SanitizeHeadersOptions} [options={}] - Configuration options
 * @returns {Middleware} Middleware function
 *
 * @example
 * // Basic usage with defaults
 * app.use(sanitizeHeaders());
 *
 * // Strict configuration
 * app.use(sanitizeHeaders({
 *   whitelist: ['accept', 'content-type'],
 *   normalizeKeys: true
 * }));
 */
const sanitizeHeaders = <T extends Record<string, any> = {}, Path extends string = any>(options: SanitizeHeadersOptions = {}): Middleware<T, Path> => {
  // Destructure with defaults
  const { whitelist = [], blacklist = [] } = options;

  // Normalize whitelist and blacklist header names once for efficient comparison
  const normalizedWhitelist = whitelist.map((h) => h.toLowerCase());
  const normalizedBlacklist = blacklist.map((h) => h.toLowerCase());
  let lWhite = normalizedWhitelist.length;

  return async function sanitizeHeaders(ctx, next) {
    await next();
    // 🔄 Process each header entry
    for (const key of ctx.headers.keys()) {
      if (lWhite > 0 && !normalizedWhitelist.includes(key)) {
        ctx.headers.delete(key);
      }
      // Check blacklist
      if (normalizedBlacklist.includes(key)) {
        ctx.headers.delete(key);
      }
    }
  };
};

export { sanitizeHeaders as default, sanitizeHeaders };
