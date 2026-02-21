import { Context } from "../index.js";
import { HttpBaseResponse, Middleware } from "../types/index.js";
function base64DecodeUtf8(base64: string): string {
  const binary = atob(base64); // decode Base64 to binary string
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes); // decode Uint8Array to UTF-8 string
}
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
  validate: (
    username: string,
    password: string,
    ctx: Context,
  ) => boolean | Promise<boolean>;

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
export const basicAuth = <
  T extends Record<string, any> = {},
  Path extends string = any,
>(
  options: BasicAuthOptions,
): Middleware<T, Path> => {
  const {
    validate,
    realm = "Restricted Area",
    onUnauthorized = (ctx, error) => {
      ctx.status(401).headers.set("WWW-Authenticate", `Basic realm="${realm}"`);
      return ctx.json({ error: error?.message || "Unauthorized" });
    },
  } = options;

  return async (ctx, next) => {
    const auth = ctx.req.header("authorization");
    if (!auth || !auth.startsWith("Basic ")) {
      return onUnauthorized(
        ctx,
        new Error("Basic authentication required"),
      );
    }

    const base64 = auth.slice(6).trim();
    if (!base64) {
      return onUnauthorized(ctx, new Error("Empty credentials"));
    }
    let username: string, password: string;
    try {
      const decoded = base64DecodeUtf8(base64);

      const idx = decoded.indexOf(":");
      ctx.status(400);
      if (idx === -1) throw new Error("Missing colon in credentials");
      username = decoded.slice(0, idx);
      password = decoded.slice(idx + 1);

      const valid = await validate(username, password, ctx);
      if (!valid) {
        ctx.status(403);
        return onUnauthorized(
          ctx,
          new Error("Invalid username or password"),
        );
      }
      // Attach to context for downstream use
      (ctx as any).user = { username };
      await next();
    }
    catch (err) {
      let error = err instanceof Error ? err : new Error(err as any);
      return onUnauthorized(ctx, error);
    }
  };
};

export default basicAuth;
