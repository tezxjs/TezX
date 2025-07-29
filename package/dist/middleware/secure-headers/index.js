const secureHeaders = (options = {}) => {
    return async function secureHeaders(ctx, next) {
        const resolveValue = (value) => {
            return typeof value === "function" ? value(ctx) : value;
        };
        const contentSecurityPolicy = resolveValue(options.contentSecurityPolicy) ||
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
        const frameGuard = resolveValue(options.frameGuard) ?? true;
        const hsts = resolveValue(options.hsts) ?? true;
        const xssProtection = resolveValue(options.xssProtection) ?? true;
        const noSniff = resolveValue(options.noSniff) ?? true;
        const referrerPolicy = resolveValue(options.referrerPolicy) || "no-referrer";
        const permissionsPolicy = resolveValue(options.permissionsPolicy) ||
            "geolocation=(), microphone=(), camera=()";
        if (contentSecurityPolicy) {
            ctx.setHeader("Content-Security-Policy", contentSecurityPolicy);
        }
        if (frameGuard) {
            ctx.setHeader("X-Frame-Options", "DENY");
        }
        if (hsts) {
            ctx.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
        }
        if (xssProtection) {
            ctx.setHeader("X-XSS-Protection", "1; mode=block");
        }
        if (noSniff) {
            ctx.setHeader("X-Content-Type-Options", "nosniff");
        }
        if (referrerPolicy) {
            ctx.setHeader("Referrer-Policy", referrerPolicy);
        }
        if (permissionsPolicy) {
            ctx.setHeader("Permissions-Policy", permissionsPolicy);
        }
        return await next();
    };
};
export { secureHeaders, secureHeaders as default, };
