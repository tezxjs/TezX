import { Context, Middleware } from "../../index.js";

export type DynamicHeaderValue =
    | string
    | ((ctx: Context) => string | undefined);

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
     * frameGuard: (ctx) => !ctx.pathname.startsWith('/embed/') // Disable for embed routes
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
const secureHeaders = (
    options: SecurityHeaderOptions = {},
): Middleware<any> => {
    return async function secureHeaders(ctx, next) {
        /**
         * 🔄 Resolves dynamic values (either static or function-based)
         * @param value The value to resolve
         * @returns Resolved value
         */
        const resolveValue = (value: any): string | undefined => {
            return typeof value === "function" ? value(ctx) : value;
        };

        // Resolve all options with defaults
        const contentSecurityPolicy =
            resolveValue(options.contentSecurityPolicy) ||
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";

        const frameGuard = resolveValue(options.frameGuard) ?? true;
        const hsts = resolveValue(options.hsts) ?? true;
        const xssProtection = resolveValue(options.xssProtection) ?? true;
        const noSniff = resolveValue(options.noSniff) ?? true;
        const referrerPolicy =
            resolveValue(options.referrerPolicy) || "no-referrer";
        const permissionsPolicy =
            resolveValue(options.permissionsPolicy) ||
            "geolocation=(), microphone=(), camera=()";

        // 🚦 Set headers based on resolved values
        if (contentSecurityPolicy) {
            ctx.headers.set("Content-Security-Policy", contentSecurityPolicy);
        }
        if (frameGuard) {
            ctx.headers.set("X-Frame-Options", "DENY");
        }
        if (hsts) {
            ctx.headers.set(
                "Strict-Transport-Security",
                "max-age=63072000; includeSubDomains",
            );
        }
        if (xssProtection) {
            ctx.headers.set("X-XSS-Protection", "1; mode=block");
        }
        if (noSniff) {
            ctx.headers.set("X-Content-Type-Options", "nosniff");
        }
        if (referrerPolicy) {
            ctx.headers.set("Referrer-Policy", referrerPolicy);
        }
        if (permissionsPolicy) {
            ctx.headers.set("Permissions-Policy", permissionsPolicy);
        }

        // ⏭️ Proceed to next middleware
        return await next();
    };
};


export {
    secureHeaders, secureHeaders as default,
}