import { Context } from "../index.js";
import { HttpBaseResponse, Middleware } from "../types/index.js";
/**
 * Options for Basic Authentication middleware.
 */
export type BasicAuthOptions = {
    /**
     * Function to validate the username and password.
     * Can return a boolean or a Promise<boolean>.
     *
     * @param username - The username extracted from the request.
     * @param password - The password extracted from the request.
     * @param ctx - The current request context.
     * @returns Whether the credentials are valid.
     */
    validate: (username: string, password: string, ctx: Context) => boolean | Promise<boolean>;
    /**
     * Realm name shown in the `WWW-Authenticate` header.
     * Defaults to `"Restricted Area"`.
     */
    realm?: string;
    /**
     * Custom handler for unauthorized requests.
     *
     * @param ctx - The current request context.
     * @param error - Optional error object describing why access was denied.
     * @returns HttpBaseResponse to send to the client.
     */
    onUnauthorized?: (ctx: Context, error?: Error) => HttpBaseResponse;
};
/**
 * Basic Authentication Middleware
 *
 * Verifies that incoming requests contain a valid Basic Auth header
 * (`Authorization: Basic <base64-credentials>`). Supports async
 * validation and custom unauthorized handling.
 *
 * @param options - Configuration options for validation, realm, and error handling.
 * @returns Middleware function to use in routes.
 *
 * @example
 * ```ts
 * import basicAuth from "./middleware/basicAuth.js";
 *
 * const auth = basicAuth({
 *   validate: async (username, password) => username === "admin" && password === "1234",
 * });
 *
 * app.use("/admin", auth, (ctx) => {
 *   ctx.json({ message: "Access granted" });
 * });
 * ```
 */
export declare const basicAuth: <T extends Record<string, any> = {}, Path extends string = any>(options: BasicAuthOptions) => Middleware<T, Path>;
export default basicAuth;
