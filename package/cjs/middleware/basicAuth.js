"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAuth = void 0;
const config_1 = require("../core/config");
const colors_1 = require("../utils/colors");
const detectBot_1 = require("./detectBot");
const basicAuth = (options) => {
    const { validateCredentials, getRealm = () => "Restricted Area", onUnauthorized = (ctx, error) => {
        const realm = getRealm(ctx);
        ctx.setStatus = 401;
        ctx.header("WWW-Authenticate", `Basic realm="${realm}"`);
        ctx.body = { error: error?.message };
    }, rateLimit, supportedMethods = ["basic", "api-key", "bearer-token"], checkAccess, } = options;
    let storage = rateLimit?.storage;
    if (rateLimit && !rateLimit.storage) {
        storage = (0, detectBot_1.createRateLimitDefaultStorage)();
    }
    return async (ctx, next) => {
        let authMethod;
        let credentials = {};
        const authHeader = ctx.req.headers.get("authorization");
        if (authHeader) {
            if (authHeader.startsWith("Basic ")) {
                authMethod = "basic";
                const base64Credentials = authHeader.split(" ")[1];
                const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8");
                const [username, password] = decoded.split(":");
                credentials = { username, password };
            }
            else if (authHeader.startsWith("Bearer ")) {
                authMethod = "bearer-token";
                credentials = { token: authHeader.split(" ")[1] };
            }
        }
        else if (ctx.headers.get("x-api-key")) {
            authMethod = "api-key";
            credentials = { apiKey: ctx.headers.get("x-api-key") };
        }
        if (!authMethod || !supportedMethods.includes(authMethod)) {
            config_1.GlobalConfig.debugging.error(`${colors_1.COLORS.bgRed}[AUTH]${colors_1.COLORS.reset} Unsupported or missing authentication method.`);
            return onUnauthorized(ctx, new Error("Unsupported authentication method"));
        }
        if (rateLimit) {
            let key = `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`;
            const { check, entry } = (0, detectBot_1.isRateLimit)(ctx, key, storage, rateLimit.maxRequests, rateLimit.windowMs);
            if (check) {
                const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
                ctx.headers.set("Retry-After", retryAfter.toString());
                return onUnauthorized(ctx, new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`));
            }
        }
        try {
            const isValid = await validateCredentials(authMethod, credentials, ctx);
            if (!isValid) {
                throw new Error("Invalid credentials.");
            }
            if (checkAccess) {
                const hasAccess = await checkAccess(ctx, credentials);
                if (!hasAccess) {
                    return onUnauthorized(ctx, new Error("Access denied."));
                }
            }
            return await next();
        }
        catch (error) {
            config_1.GlobalConfig.debugging.error(`${colors_1.COLORS.bgRed}[AUTH]${colors_1.COLORS.reset} Failure for method: ${ctx.method}`);
            return onUnauthorized(ctx, error);
        }
    };
};
exports.basicAuth = basicAuth;
