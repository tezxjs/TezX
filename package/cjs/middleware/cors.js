"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cors = cors;
exports.default = cors;
function cors(option = {}) {
    const { credentials, maxAge, origin } = option;
    let methods = (option.methods || ["GET", "POST", "PUT", "DELETE"]).join(", ");
    let allowedHeaders = (option.allowedHeaders || ["Content-Type", "Authorization"]).join(", ");
    let exposedHeaders = option?.exposedHeaders?.join(", ");
    return async function cors(ctx, next) {
        const reqOrigin = ctx.req.header("origin") || "";
        let allowOrigin = "*";
        if (typeof origin === "string") {
            allowOrigin = origin;
        }
        else if (Array.isArray(origin)) {
            allowOrigin = origin.includes(reqOrigin) ? reqOrigin : "";
        }
        else if (typeof origin === "function") {
            allowOrigin = origin(reqOrigin) ? reqOrigin : "";
        }
        ctx.headers.set("Access-Control-Allow-Origin", allowOrigin);
        ctx.headers.set("Access-Control-Allow-Methods", methods);
        ctx.headers.set("Access-Control-Allow-Headers", allowedHeaders);
        if (exposedHeaders) {
            ctx.headers.set("Access-Control-Expose-Headers", exposedHeaders);
        }
        if (credentials) {
            ctx.headers.set("Access-Control-Allow-Credentials", "true");
        }
        if (maxAge) {
            ctx.headers.set("Access-Control-Max-Age", maxAge.toString());
        }
        if (ctx.req.method === "OPTIONS") {
            return new Response(null, { status: 204, headers: ctx.headers });
        }
        return await next();
    };
}
