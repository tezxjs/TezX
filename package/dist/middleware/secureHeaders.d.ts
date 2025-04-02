import { Context } from "../context";
import { Middleware } from "../router";
export type DynamicHeaderValue = string | ((ctx: Context) => string | undefined);
export type SecurityHeaderOptions = {
    /**
     * 🔵 Content Security Policy header value
     * @default "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
     * @example
     * contentSecurityPolicy: "default-src 'none'; script-src 'self' https://trusted.cdn.com"
     * contentSecurityPolicy: (ctx) => ctx.isAdmin ? "default-src 'self'" : "default-src 'none'"
     */
    contentSecurityPolicy?: DynamicHeaderValue;
    /**
     * 🟢 Whether to set X-Frame-Options header (clickjacking protection)
     * @default true
     * @example
     * frameGuard: true // Always enable
     * frameGuard: (ctx) => !ctx.path.startsWith('/embed/') // Disable for embed routes
     */
    frameGuard?: boolean | ((ctx: Context) => boolean);
    /**
     * 🟣 HTTP Strict Transport Security (HSTS) header
     * @default true
     * @example
     * hsts: true // Enable with 2 year duration
     * hsts: (ctx) => ctx.secure // Enable only for HTTPS
     */
    hsts?: boolean | ((ctx: Context) => boolean);
    /**
     * 🟠 XSS Protection header
     * @default true
     * @example
     * xssProtection: false // Disable legacy XSS filter
     */
    xssProtection?: boolean | ((ctx: Context) => boolean);
    /**
     * 🟡 X-Content-Type-Options header (MIME sniffing prevention)
     * @default true
     * @example
     * noSniff: false // Only disable if you have specific needs
     */
    noSniff?: boolean | ((ctx: Context) => boolean);
    /**
     * 🔴 Referrer Policy header
     * @default "no-referrer"
     * @example
     * referrerPolicy: "strict-origin-when-cross-origin"
     */
    referrerPolicy?: DynamicHeaderValue;
    /**
     * 🟤 Permissions Policy header (formerly Feature Policy)
     * @default "geolocation=(), microphone=(), camera=()"
     * @example
     * permissionsPolicy: "geolocation=(self 'https://example.com')"
     */
    permissionsPolicy?: DynamicHeaderValue;
};
/**
 * 🛡️ Comprehensive security headers middleware
 *
 * Sets multiple security-related HTTP headers with dynamic configuration.
 * All headers can be configured per-request using functions.
 *
 * @param {SecurityHeaderOptions} [options={}] - Configuration options
 * @returns {Middleware} Middleware function
 *
 * @example
 * // Basic usage with defaults
 * app.use(secureHeaders());
 *
 * // Custom configuration
 * app.use(secureHeaders({
 *   contentSecurityPolicy: "default-src 'self'",
 *   frameGuard: (ctx) => !ctx.isEmbedded,
 *   referrerPolicy: "strict-origin-when-cross-origin"
 * }));
 */
export declare const secureHeaders: (options?: SecurityHeaderOptions) => Middleware;
