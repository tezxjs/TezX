import { Middleware } from "..";
import { Context } from "../core/context";
import { CallbackReturn } from "../core/router";
/**
 * Supported authentication method types.
 */
type AuthMethod = "basic" | "api-key" | "bearer-token";
/**
 * Configuration options for dynamic basic authentication.
 */
type DynamicBasicAuthOptions = {
    /**
     * 🔐 Function to validate the provided credentials.
     * @param method - The method of authentication.
     * @param credentials - The extracted credentials.
     * @param ctx - The current request context.
     * @returns A boolean or Promise resolving to whether the credentials are valid.
     */
    validateCredentials: (method: AuthMethod, credentials: Record<string, any>, ctx: Context) => boolean | Promise<boolean>;
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
    onUnauthorized?: (ctx: Context, error?: Error) => CallbackReturn;
    /**
     * 🚦 Rate-limiting configuration.
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
            delete: (key: string) => void;
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
    checkAccess?: (ctx: Context, credentials: Record<string, any>) => boolean | Promise<boolean>;
};
/**
 * 🔐 Middleware for flexible authentication using Basic, API Key, or Bearer Token.
 * Supports rate limiting, IP filtering, and role-based access control.
 *
 * @param options - Custom authentication handler options.
 * @returns A middleware function.
 */
export declare const basicAuth: (options: DynamicBasicAuthOptions) => Middleware;
export {};
