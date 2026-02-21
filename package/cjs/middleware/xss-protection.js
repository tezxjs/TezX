"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xssProtection = exports.default = void 0;
const xssProtection = (options = {}) => {
    const { enabled = true, mode = "block", fallbackCSP = "default-src 'self'; script-src 'self';", } = options;
    return async function xssProtection(ctx, next) {
        const isEnabled = typeof enabled === "function" ? enabled(ctx) : enabled;
        if (!isEnabled) {
            return await next();
        }
        const xssHeaderValue = mode === "block" ? "1; mode=block" : "1";
        ctx.setHeader("X-XSS-Protection", xssHeaderValue);
        if (fallbackCSP) {
            const existingCSP = ctx.req.header("content-security-policy");
            if (!existingCSP) {
                ctx.setHeader("Content-Security-Policy", fallbackCSP);
            }
        }
        return await next();
    };
};
exports.default = xssProtection;
exports.xssProtection = xssProtection;
