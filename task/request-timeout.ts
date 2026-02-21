import { Context } from "../core/context.js";
import { TezXError } from "../core/error.js";
import { HttpBaseResponse, Middleware } from "../types/index.js";

/**
 * Options for `requestTimeout` middleware.
 */
export type TimeoutOptions = {
  /**
   * ⏳ Function to dynamically determine timeout duration (in milliseconds)
   * based on the current request context.
   */
  getTimeout: (ctx: Context) => number;

  /**
   * 🚫 Custom handler invoked when a request exceeds the timeout.
   * @param ctx - Current request context.
   * @param error - TezXError describing the timeout.
   * @returns HttpBaseResponse or void.
   */
  onTimeout?: (ctx: Context, error: TezXError) => HttpBaseResponse | void;
};

/**
 * Middleware to enforce dynamic request timeouts per request.
 *
 * @example
 * ```ts
 * app.use(requestTimeout({
 *   getTimeout: (ctx) => ctx.path.startsWith('/slow') ? 10000 : 3000,
 *   onTimeout: (ctx, err) => ctx.status(504).json({ error: err.message })
 * }));
 * ```
 *
 * @param options - Timeout configuration.
 * @returns Middleware function for TezX.
 */
export const requestTimeout = <
  T extends Record<string, any> = {},
  Path extends string = any,
>({
  getTimeout,
  onTimeout = (ctx) => {
    return ctx.status(504).json({ error: "Request timed out." });
  }
}: TimeoutOptions): Middleware<T, Path> => {
  return async (ctx, next) => {
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      const timeout = getTimeout(ctx);
      // Promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new TezXError(`Request timed out after ${timeout}ms`)), timeout);
      });
      next()
      // Run the next middleware/handler with timeout race
      return await Promise.race([next(), timeoutPromise]);
    } catch (err: any) {
      return onTimeout(ctx, err);
    } finally {
      if (timeoutId) clearTimeout(timeoutId); // prevent memory leaks
    }
  };
};

export default requestTimeout;
