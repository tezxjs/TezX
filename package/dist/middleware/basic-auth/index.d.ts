import { Context } from "../../core/context.js";
import { HttpBaseResponse, Middleware } from "../../types/index.js";
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
    validateCredentials: (method: AuthMethod, credentials: AuthCredential, ctx: Context) => boolean | Promise<boolean>;
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
            get: (key: string) => {
                count: number;
                resetTime: number;
            } | undefined;
            set: (key: string, value: {
                count: number;
                resetTime: number;
            }) => void;
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
    checkAccess?: (ctx: Context, credentials: AuthCredential) => boolean | Promise<boolean>;
};
/**
 * 🔐 Middleware for flexible authentication using Basic, API Key, or Bearer Token.
 * Supports rate limiting, IP filtering, and role-based access control.
 *
 * @param options - Custom authentication handler options.
 * @returns A middleware function.
 */
declare const basicAuth: (options: DynamicBasicAuthOptions) => Middleware;
export { basicAuth, basicAuth as default };
