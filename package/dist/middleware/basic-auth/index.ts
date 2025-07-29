import { Buffer } from "node:buffer";
import { GlobalConfig } from "../../core/config.js";
import { Context } from "../../core/context.js";
import { HttpBaseResponse, Middleware } from "../../types/index.js";
import { colorText } from "../../utils/colors.js";
import { createRateLimitDefaultStorage, isRateLimit } from "../../utils/rateLimit.js";
/**
 * Supported authentication method types.
 */

export type AuthMethod = "basic" | "api-key" | "bearer-token";
export type AuthCredential = {
    username?: any;
    password?: any;
    token?: any;
    apiKey?: any;
};
/**
 * Configuration options for dynamic basic authentication.
 */
export type DynamicBasicAuthOptions = {
    /**
     * 🔐 Function to validate the provided credentials.
     * @param method - The method of authentication.
     * @param credentials - The extracted credentials.
     * @param ctx - The current request context.
     * @returns A boolean or Promise resolving to whether the credentials are valid.
     */
    validateCredentials: (
        method: AuthMethod,
        credentials: AuthCredential,
        ctx: Context,
    ) => boolean | Promise<boolean>;

    /**
     * 🔒 Function to dynamically determine the realm for authentication prompt.
     * @param ctx - The current request context.
     * @returns The authentication realm string.
     */
    getRealm?: (ctx: Context) => string;

    /**
     * ❌ Custom handler for unauthorized access.
     * @param ctx - The current request context.
     * @param error - Optional error information.
     * @returns A CallbackReturn to end the response.
     */
    onUnauthorized?: (ctx: Context, error?: Error) => HttpBaseResponse;

    /**
     * 🚦 Rate-limiting configuration.
     *  @requires getConnInfo middleware. for parse remote address.
     */
    rateLimit?: {
        /**
         * 🧠 Custom cache or storage for rate-limit tracking.
         */
        storage?: {
            get: (key: string) => { count: number; resetTime: number } | undefined;
            set: (key: string, value: { count: number; resetTime: number }) => void;
            clearExpired: () => void;
        };
        /** 🔁 Max requests allowed within the window */
        maxRequests: number;
        /** ⏲️ Duration of window in milliseconds */
        windowMs: number;
    };

    /**
     * 🛠 Supported authentication types.
     * @default ["basic"]
     */
    supportedMethods?: AuthMethod[];

    /**
     * 🧑‍⚖️ Optional RBAC (Role-Based Access Control) check.
     * @param ctx - The current request context.
     * @param credentials - The validated credentials.
     * @returns Whether access is allowed.
     */
    checkAccess?: (
        ctx: Context,
        credentials: AuthCredential,
    ) => boolean | Promise<boolean>;
};

/**
 * 🔐 Middleware for flexible authentication using Basic, API Key, or Bearer Token.
 * Supports rate limiting, IP filtering, and role-based access control.
 *
 * @param options - Custom authentication handler options.
 * @returns A middleware function.
 */
const basicAuth = (options: DynamicBasicAuthOptions): Middleware => {
    const {
        validateCredentials,
        getRealm = () => "Restricted Area",
        onUnauthorized = (ctx, error) => {
            const realm = getRealm(ctx); // Dynamically generate the realm
            ctx.setStatus = 401; // Unauthorized
            ctx.setHeader("WWW-Authenticate", `Basic realm="${realm}"`);
            // ctx.set("WWW-Authenticate", `Basic realm="${getRealm(ctx)}"`);
            ctx.body = { error: error?.message };
        },
        rateLimit,
        supportedMethods = ["basic", "api-key", "bearer-token"],
        checkAccess,
    } = options;
    let storage = rateLimit?.storage;
    if (rateLimit && !rateLimit.storage) {
        storage = createRateLimitDefaultStorage();
    }
    return async function basicAuth(ctx, next) {
        let authMethod: AuthMethod | undefined;
        let credentials: AuthCredential = {};

        const auth = ctx.req.header("authorization");
        if (auth) {
            if (auth.startsWith("Basic ")) {
                authMethod = "basic";
                const base64Credentials = auth.split(" ")[1];
                const decoded = Buffer.from(base64Credentials, "base64").toString("utf-8",);
                const [username, password] = decoded.split(":");
                credentials = { username, password };
            } else if (auth.startsWith("Bearer ")) {
                authMethod = "bearer-token";
                credentials = { token: auth.split(" ")[1] };
            }
        }
        else if (ctx.headers.get("x-api-key")) {
            authMethod = "api-key";
            credentials = { apiKey: ctx.headers.get("x-api-key") };
        }

        if (!authMethod || !supportedMethods.includes(authMethod)) {
            GlobalConfig.debugging.error(
                `${colorText("[AUTH]", "bgRed")} Unsupported or missing authentication method.`,
            );
            return onUnauthorized(
                ctx,
                new Error("Unsupported authentication method"),
            );
        }

        // Step 3: Rate limiting
        if (rateLimit) {
            // Please use injectRemoteAddress middleware
            let key = `${ctx.req.remoteAddress.address}:${ctx.req.remoteAddress.port}`;
            const { check, entry } = isRateLimit(
                ctx,
                key,
                storage,
                rateLimit.maxRequests,
                rateLimit.windowMs,
            );

            if (check) {
                const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000);
                ctx.setHeader("Retry-After", retryAfter.toString());
                return onUnauthorized(
                    ctx,
                    new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds.`),
                );
            }
        }

        try {
            // Step 4: Validate the credentials
            const isValid = await validateCredentials(authMethod, credentials, ctx);

            if (!isValid) {
                throw new Error("Invalid credentials.");
            }

            // Step 5: Role-based access control
            if (checkAccess) {
                const hasAccess = await checkAccess(ctx, credentials);
                if (!hasAccess) {
                    return onUnauthorized(ctx, new Error("Access denied."));
                }
            }
            // Proceed to the next middleware
            return await next();
        } catch (error: any) {
            GlobalConfig.debugging.error(
                `${colorText("[AUTH]", "bgRed")} Failure for method: ${ctx.method}`,
            );
            return onUnauthorized(ctx, error as Error);
        }
    };
};


export {
    basicAuth, basicAuth as default
};