import { TezXError, TezXErrorParse } from "../core/error.js";
import { base64Decode } from "../utils/buffer.js";
export const basicAuth = (options) => {
    const { validate, realm = "Restricted Area", onUnauthorized = (ctx, error) => {
        ctx.setStatus = 401;
        ctx.headers.set("WWW-Authenticate", `Basic realm="${realm}"`);
        return ctx.json({ error: error?.message || "Unauthorized" });
    }, } = options;
    return async (ctx, next) => {
        const auth = ctx.req.header("authorization");
        if (!auth || !auth.startsWith("Basic ")) {
            return onUnauthorized(ctx, new TezXError("Basic authentication required"));
        }
        const base64 = auth.slice(6).trim();
        if (!base64) {
            return onUnauthorized(ctx, new TezXError("Empty credentials"));
        }
        let username, password;
        try {
            const decoded = base64Decode(base64);
            const idx = decoded.indexOf(":");
            if (idx === -1)
                throw new TezXError("Missing colon in credentials", 400);
            username = decoded.slice(0, idx);
            password = decoded.slice(idx + 1);
            const valid = await validate(username, password, ctx);
            if (!valid) {
                return onUnauthorized(ctx, new TezXError("Invalid username or password", 403));
            }
            ctx.user = { username };
            await next();
        }
        catch (err) {
            return onUnauthorized(ctx, TezXErrorParse(err));
        }
    };
};
export default basicAuth;
