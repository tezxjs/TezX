"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAuth = void 0;
function base64DecodeUtf8(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}
const basicAuth = (options) => {
    const { validate, realm = "Restricted Area", onUnauthorized = (ctx, error) => {
        ctx.status(401).headers.set("WWW-Authenticate", `Basic realm="${realm}"`);
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
            const decoded = base64DecodeUtf8(base64);
            const idx = decoded.indexOf(":");
            ctx.status(400);
            if (idx === -1)
                throw new Error("Missing colon in credentials");
            username = decoded.slice(0, idx);
            password = decoded.slice(idx + 1);
            const valid = await validate(username, password, ctx);
            if (!valid) {
                ctx.status(403);
                return onUnauthorized(ctx, new Error("Invalid username or password"));
            }
            ctx.user = { username };
            await next();
        }
        catch (err) {
            let error = err instanceof Error ? err : new Error(err);
            return onUnauthorized(ctx, error);
        }
    };
};
exports.basicAuth = basicAuth;
exports.default = exports.basicAuth;
