"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bearerAuth = void 0;
const bearerAuth = (options) => {
    const { validate, realm = "API", onUnauthorized = (ctx, error) => {
        ctx.status(401);
        ctx.setHeader("WWW-Authenticate", `Bearer realm="${realm}"`);
        return ctx.json({ error: error?.message || "Unauthorized" });
    }, } = options;
    return async (ctx, next) => {
        const auth = ctx.req.header("authorization");
        if (!auth || !auth.startsWith("Bearer ")) {
            return onUnauthorized(ctx, new Error("Bearer token required"));
        }
        const token = auth.slice(7).trim();
        if (!token) {
            return onUnauthorized(ctx, new Error("Empty token"));
        }
        try {
            const valid = await validate(token, ctx);
            if (!valid) {
                return onUnauthorized(ctx, new Error("Invalid or expired token"));
            }
            ctx.token = token;
            await next();
        }
        catch (err) {
            let error = err instanceof Error ? err : new Error(err);
            return onUnauthorized(ctx, error);
        }
    };
};
exports.bearerAuth = bearerAuth;
exports.default = exports.bearerAuth;
