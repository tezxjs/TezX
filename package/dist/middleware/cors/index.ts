import { Ctx } from "../../types/index.js";

export type CorsOptions = {
    origin?:
    | string
    | RegExp
    | (string | RegExp)[]
    | ((reqOrigin: string) => boolean);
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
};

function cors(option: CorsOptions = {}) {
    const {
        methods,
        allowedHeaders,
        credentials,
        exposedHeaders,
        maxAge,
        origin,
    } = option;
    return async function cors(ctx: Ctx, next: () => Promise<any>) {
        const reqOrigin = ctx.req.header("origin") || "";
        // // Handle dynamic origin
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
        // // CORS Headers
        ctx.headers.set("Access-Control-Allow-Origin", allowOrigin);
        ctx.headers.set(
            "Access-Control-Allow-Methods",
            (methods || ["GET", "POST", "PUT", "DELETE"]).join(", "),
        );
        ctx.headers.set(
            "Access-Control-Allow-Headers",
            (allowedHeaders || ["Content-Type", "Authorization"]).join(", "),
        );

        if (exposedHeaders) {
            ctx.headers.set(
                "Access-Control-Expose-Headers",
                exposedHeaders.join(", "),
            );
        }

        if (credentials) {
            ctx.headers.set("Access-Control-Allow-Credentials", "true");
        }

        if (maxAge) {
            ctx.headers.set("Access-Control-Max-Age", maxAge.toString());
        }

        // // Handle preflight (OPTIONS) requests
        if (ctx.req.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: ctx.headers,
            });
        }
        return await next();
    };
}

export {
    cors, cors as default
};