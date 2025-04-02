import { GlobalConfig } from "../config/config";
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
export const xssProtection = (options = {}) => {
    // Destructure with defaults
    const { enabled = true, mode = "block", fallbackCSP = "default-src 'self'; script-src 'self';", } = options;
    return async (ctx, next) => {
        // 🔄 Resolve dynamic enabled check if function provided
        const isEnabled = typeof enabled === "function" ? enabled(ctx) : enabled;
        if (!isEnabled) {
            GlobalConfig.debugging.warn("🟠 XSS protection is disabled.");
            return await next();
        }
        // 🚦 Set X-XSS-Protection header based on mode
        const xssHeaderValue = mode === "block" ? "1; mode=block" : "1";
        ctx.headers.set("X-XSS-Protection", xssHeaderValue);
        GlobalConfig.debugging.warn(`🟢 X-XSS-Protection set to: ${xssHeaderValue}`);
        // ⚠️ Add fallback CSP if no existing CSP present
        if (fallbackCSP) {
            const existingCSP = ctx.headers.get("Content-Security-Policy");
            if (!existingCSP) {
                ctx.headers.set("Content-Security-Policy", fallbackCSP);
                GlobalConfig.debugging.warn(`🟣 Fallback CSP set to: ${fallbackCSP}`);
            }
        }
        // ⏭️ Proceed to next middleware
        return await next();
    };
};
