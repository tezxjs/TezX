import { Context } from "../index.js";
import { HttpBaseResponse, Middleware } from "../types/index.js";

/**
 * Options for Bearer Authentication middleware.
 */
export type BearerAuthOptions = {
  /**
   * Function to validate the token.
   * Can be synchronous or asynchronous.
   * @param token - The Bearer token from the request.
   * @param ctx - The current request context.
   * @returns Boolean indicating if the token is valid.
   */
  validate: (token: string, ctx: Context) => boolean | Promise<boolean>;

  /**
   * Realm name shown in the `WWW-Authenticate` header.
   * Defaults to `"API"`.
   */
  realm?: string;

  /**
   * Custom handler for unauthorized requests.
   * @param ctx - The current request context.
   * @param error - Optional error object describing the reason.
   * @returns HttpBaseResponse to send to the client.
   */
  onUnauthorized?: (ctx: Context, error?: Error) => HttpBaseResponse;
};

/**
 * Bearer Authentication Middleware
 *
 * Verifies that incoming requests contain a valid Bearer token
 * in the `Authorization` header. Supports async token validation
 * and custom error handling.
 *
 * @param options - Configuration options for token validation, realm, and error handling.
 * @returns Middleware function to use in routes.
 *
 * @example
 * ```ts
 * import { bearerAuth } from "./middleware/bearerAuth.js";
 *
 * const auth = bearerAuth({
 *   validate: async (token) => token === "secret-token",
 * });
 *
 * app.use("/api", auth, (ctx) => {
 *   ctx.json({ message: "Access granted" });
 * });
 * ```
 */
export const bearerAuth = <
  T extends Record<string, any> = {},
  Path extends string = any,
>(
  options: BearerAuthOptions,
): Middleware<T, Path> => {
  const {
    validate,
    realm = "API",
    onUnauthorized = (ctx, error) => {
      ctx.status(401);
      ctx.setHeader("WWW-Authenticate", `Bearer realm="${realm}"`);
      return ctx.json({ error: error?.message || "Unauthorized" });
    },
  } = options;

  return async (ctx, next) => {
    const auth = ctx.req.header("authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return onUnauthorized(ctx, new Error("Bearer token required"));
    }

    const token = auth.slice(7).trim();
    if (!token) {
      return onUnauthorized(ctx, new Error("Empty token"));
    }

    try {
      const valid = await validate(token, ctx);
      if (!valid) {
        return onUnauthorized(ctx, new Error("Invalid or expired token"));
      }
      // Attach token/user to context
      (ctx as any).token = token;
      await next();
    } catch (err) {
      let error = err instanceof Error ? err : new Error(err as any);
      return onUnauthorized(ctx, error);
    }
  };
};

export default bearerAuth;
