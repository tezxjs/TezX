import { Buffer } from "node:buffer";
export const basicAuth = (options) => {
    const { validate, realm = "Restricted Area", onUnauthorized = (ctx, error) => {
        ctx.setStatus = 401;
        ctx.setHeader("WWW-Authenticate", `Basic realm="${realm}"`);
        return ctx.json({ error: error?.message || "Unauthorized" });
    }, } = options;
    return async (ctx, next) => {
        const auth = ctx.req.header("authorization");
        if (!auth || !auth.startsWith("Basic ")) {
            return onUnauthorized(ctx, new Error("Basic authentication required"));
        }
        const base64 = auth.slice(6).trim();
        if (!base64) {
            return onUnauthorized(ctx, new Error("Empty credentials"));
        }
        let username, password;
        try {
            const decoded = Buffer.from(base64, "base64").toString("utf-8");
            const idx = decoded.indexOf(":");
            if (idx === -1)
                throw new Error("Missing colon in credentials");
            username = decoded.slice(0, idx);
            password = decoded.slice(idx + 1);
        }
        catch (err) {
            return onUnauthorized(ctx, new Error("Invalid Basic auth format"));
        }
        try {
            const valid = await validate(username, password, ctx);
            if (!valid) {
                return onUnauthorized(ctx, new Error("Invalid username or password"));
            }
            ctx.user = { username };
            await next();
        }
        catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            return onUnauthorized(ctx, error);
        }
    };
};
export default basicAuth;
