"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAuth = void 0;
const error_js_1 = require("../core/error.js");
const buffer_js_1 = require("../utils/buffer.js");
const basicAuth = (options) => {
    const { validate, realm = "Restricted Area", onUnauthorized = (ctx, error) => {
        ctx.setStatus = 401;
        ctx.headers.set("WWW-Authenticate", `Basic realm="${realm}"`);
        return ctx.json({ error: error?.message || "Unauthorized" });
    }, } = options;
    return async (ctx, next) => {
        const auth = ctx.req.header("authorization");
        if (!auth || !auth.startsWith("Basic ")) {
            return onUnauthorized(ctx, new error_js_1.TezXError("Basic authentication required"));
        }
        const base64 = auth.slice(6).trim();
        if (!base64) {
            return onUnauthorized(ctx, new error_js_1.TezXError("Empty credentials"));
        }
        let username, password;
        try {
            const decoded = (0, buffer_js_1.base64Decode)(base64);
            const idx = decoded.indexOf(":");
            if (idx === -1)
                throw new error_js_1.TezXError("Missing colon in credentials", 400);
            username = decoded.slice(0, idx);
            password = decoded.slice(idx + 1);
            const valid = await validate(username, password, ctx);
            if (!valid) {
                return onUnauthorized(ctx, new error_js_1.TezXError("Invalid username or password", 403));
            }
            ctx.user = { username };
            await next();
        }
        catch (err) {
            return onUnauthorized(ctx, (0, error_js_1.TezXErrorParse)(err));
        }
    };
};
exports.basicAuth = basicAuth;
exports.default = exports.basicAuth;
