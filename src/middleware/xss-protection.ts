import { Context } from "../index.js";
import { Middleware, NextCallback } from "../types/index.js";

export type XSSProtectionOptions = {
  /**
   * 🟢 Whether to enable XSS protection
   * @default true
   * @example
   * enabled: true // Always enable
   * enabled: (ctx) => !ctx.isAdmin // Disable for admin routes
   */
  enabled?: boolean | ((ctx: Context) => boolean);

  /**
   * 🔵 Protection mode to use
   * @default "block"
   * @example
   * mode: "block" // Block the page if XSS detected
   * mode: "filter" // Sanitize the page if XSS detected
   */
  mode?: "block" | "filter";

  /**
   * 🟣 Fallback CSP for browsers without XSS protection
   * @default "default-src 'self'; script-src 'self';"
   * @example
   * fallbackCSP: "default-src 'none'; script-src 'self' https://trusted.cdn.com"
   */
  fallbackCSP?: string;
};

/**
 * 🛡️ Middleware to set the X-XSS-Protection header and provide enhanced XSS mitigation
 * @param options - Configuration options for XSS protection
 * @returns Middleware function
 *
 * @example
 * // Basic usage
 * app.use(xssProtection());
 *
 * // Custom configuration
 * app.use(xssProtection({
 *   mode: "filter",
 *   fallbackCSP: "default-src 'self'"
 * }));
 */
const xssProtection = <T extends Record<string, any> = {}, Path extends string = any>(options: XSSProtectionOptions = {}): Middleware<T, Path> => {
  // Destructure with defaults
  const {
    enabled = true,
    mode = "block",
    fallbackCSP = "default-src 'self'; script-src 'self';",
  } = options;
  return async function xssProtection(ctx: Context, next: NextCallback) {
    // 🔄 Resolve dynamic enabled check if function provided
    const isEnabled = typeof enabled === "function" ? enabled(ctx) : enabled;
    if (!isEnabled) {
      return await next();
    }

    // 🚦 Set X-XSS-Protection header based on mode
    const xssHeaderValue = mode === "block" ? "1; mode=block" : "1";
    ctx.setHeader("X-XSS-Protection", xssHeaderValue);
    // ⚠️ Add fallback CSP if no existing CSP present
    if (fallbackCSP) {
      const existingCSP = ctx.req.header("content-security-policy");
      if (!existingCSP) {
        ctx.setHeader("Content-Security-Policy", fallbackCSP);
      }
    }
    // ⏭️ Proceed to next middleware
    return await next();
  };
};

export { xssProtection as default, xssProtection };
