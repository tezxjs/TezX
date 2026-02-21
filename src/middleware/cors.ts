import { Ctx, Middleware } from "../types/index.js";

export type CorsOptions = {
  /**
   * Allowed origins for CORS.
   * Can be a string, an array of strings, or a function that returns a boolean.
   */
  origin?: string | string[] | ((reqOrigin: string) => boolean);

  /**
   * Allowed HTTP methods for CORS requests.
   * Defaults to ['GET', 'POST', 'PUT', 'DELETE'].
   */
  methods?: string[];

  /**
   * Allowed headers for CORS requests.
   * Defaults to ['Content-Type', 'Authorization'].
   */
  allowedHeaders?: string[];

  /**
   * Headers exposed to the browser.
   */
  exposedHeaders?: string[];

  /**
   * Indicates whether credentials are allowed.
   */
  credentials?: boolean;

  /**
   * Preflight cache duration in seconds.
   */
  maxAge?: number;
};

/**
 * Middleware for handling Cross-Origin Resource Sharing (CORS).
 *
 * @param option - Configuration options for CORS.
 */
function cors<T extends Record<string, any> = {}, Path extends string = any>(
  option: CorsOptions = {},
): Middleware<T, Path> {
  const { credentials, maxAge, origin } = option;
  let methods = (option.methods || ["GET", "POST", "PUT", "DELETE"]).join(", ");
  let allowedHeaders = (
    option.allowedHeaders || ["Content-Type", "Authorization"]
  ).join(", ");
  let exposedHeaders = option?.exposedHeaders?.join(", ");

  return async function cors(ctx: Ctx, next: () => Promise<any>) {
    const reqOrigin = ctx.req.header("origin") || "";
    let allowOrigin = "*";

    if (typeof origin === "string") {
      allowOrigin = origin;
    } else if (Array.isArray(origin)) {
      allowOrigin = origin.includes(reqOrigin) ? reqOrigin : "";
    } else if (typeof origin === "function") {
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

    // if (ctx.method === "OPTIONS") {
    //   ctx.setStatus = 204;
    //   return;
    // }

    if (ctx.req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: ctx.headers });
    }

    return await next();
  };
}

export { cors, cors as default };
