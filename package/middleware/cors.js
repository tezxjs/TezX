export function cors(option = {}) {
    const { methods, allowedHeaders, credentials, exposedHeaders, maxAge, origin, } = option;
    return async function cors(ctx, next) {
        const reqOrigin = ctx.req.headers.get("origin") || "";
        let allowOrigin = "*";
        if (typeof origin === "string") {
            allowOrigin = origin;
        }
        else if (origin instanceof RegExp) {
            allowOrigin = origin.test(reqOrigin) ? reqOrigin : "";
        }
        else if (Array.isArray(origin)) {
            const isAllowed = origin.some((item) => {
                if (typeof item === "string") {
                    return item === reqOrigin;
                }
                else if (item instanceof RegExp) {
                    return item.test(reqOrigin);
                }
            });
            allowOrigin = isAllowed ? reqOrigin : "";
        }
        else if (typeof origin === "function") {
            allowOrigin = origin(reqOrigin) ? reqOrigin : "";
        }
        ctx.headers.set("Access-Control-Allow-Origin", allowOrigin);
        ctx.headers.set("Access-Control-Allow-Methods", (methods || ["GET", "POST", "PUT", "DELETE"]).join(", "));
        ctx.headers.set("Access-Control-Allow-Headers", (allowedHeaders || ["Content-Type", "Authorization"]).join(", "));
        if (exposedHeaders) {
            ctx.headers.set("Access-Control-Expose-Headers", exposedHeaders.join(", "));
        }
        if (credentials) {
            ctx.headers.set("Access-Control-Allow-Credentials", "true");
        }
        if (maxAge) {
            ctx.headers.set("Access-Control-Max-Age", maxAge.toString());
        }
        if (ctx.req.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: ctx.headers,
            });
        }
        return await next();
    };
}
