"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xssProtection = void 0;
const config_js_1 = require("../core/config.js");
const xssProtection = (options = {}) => {
    const { enabled = true, mode = "block", fallbackCSP = "default-src 'self'; script-src 'self';", } = options;
    return async function xssProtection(ctx, next) {
        const isEnabled = typeof enabled === "function" ? enabled(ctx) : enabled;
        if (!isEnabled) {
            config_js_1.GlobalConfig.debugging.warn("🟠 XSS protection is disabled.");
            return await next();
        }
        const xssHeaderValue = mode === "block" ? "1; mode=block" : "1";
        ctx.headers.set("X-XSS-Protection", xssHeaderValue);
        config_js_1.GlobalConfig.debugging.warn(`🟢 X-XSS-Protection set to: ${xssHeaderValue}`);
        if (fallbackCSP) {
            const existingCSP = ctx.req.headers.get("Content-Security-Policy");
            if (!existingCSP) {
                ctx.headers.set("Content-Security-Policy", fallbackCSP);
                config_js_1.GlobalConfig.debugging.warn(`🟣 Fallback CSP set to: ${fallbackCSP}`);
            }
        }
        return await next();
    };
};
exports.xssProtection = xssProtection;
