import { Context } from "../core/context.js";
import { NextCallback } from "../types/index.js";
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
declare const xssProtection: (options?: XSSProtectionOptions) => (ctx: Context, next: NextCallback) => Promise<void>;
export { xssProtection as default, xssProtection };
