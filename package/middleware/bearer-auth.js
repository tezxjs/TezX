import { TezXError, TezXErrorParse } from "../core/error.js";
export const bearerAuth = (options) => {
    const { validate, realm = "API", onUnauthorized = (ctx, error) => {
        ctx.setStatus = 401;
        ctx.setHeader("WWW-Authenticate", `Bearer realm="${realm}"`);
        return ctx.json({ error: error?.message || "Unauthorized" });
    }, } = options;
    return async (ctx, next) => {
        const auth = ctx.req.header("authorization");
        if (!auth || !auth.startsWith("Bearer ")) {
            return onUnauthorized(ctx, new TezXError("Bearer token required"));
        }
        const token = auth.slice(7).trim();
        if (!token) {
            return onUnauthorized(ctx, new TezXError("Empty token"));
        }
        try {
            const valid = await validate(token, ctx);
            if (!valid) {
                return onUnauthorized(ctx, new TezXError("Invalid or expired token"));
            }
            ctx.token = token;
            await next();
        }
        catch (err) {
            return onUnauthorized(ctx, TezXErrorParse(err));
        }
    };
};
export default bearerAuth;
