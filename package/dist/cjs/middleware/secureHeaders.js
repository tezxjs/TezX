"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secureHeaders = void 0;
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
const secureHeaders = (options = {}) => {
    return async (ctx, next) => {
        /**
         * 🔄 Resolves dynamic values (either static or function-based)
         * @param value The value to resolve
         * @returns Resolved value
         */
        const resolveValue = (value) => {
            return typeof value === "function" ? value(ctx) : value;
        };
        // Resolve all options with defaults
        const contentSecurityPolicy = resolveValue(options.contentSecurityPolicy) ||
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
        const frameGuard = resolveValue(options.frameGuard) ?? true;
        const hsts = resolveValue(options.hsts) ?? true;
        const xssProtection = resolveValue(options.xssProtection) ?? true;
        const noSniff = resolveValue(options.noSniff) ?? true;
        const referrerPolicy = resolveValue(options.referrerPolicy) || "no-referrer";
        const permissionsPolicy = resolveValue(options.permissionsPolicy) ||
            "geolocation=(), microphone=(), camera=()";
        // 🚦 Set headers based on resolved values
        if (contentSecurityPolicy) {
            ctx.headers.set("Content-Security-Policy", contentSecurityPolicy);
        }
        if (frameGuard) {
            ctx.headers.set("X-Frame-Options", "DENY");
        }
        if (hsts) {
            ctx.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
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
exports.secureHeaders = secureHeaders;
