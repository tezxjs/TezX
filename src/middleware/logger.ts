import { Middleware } from "../types/index.js";
import { colorText } from "../utils/colors.js";
/**
 * Logger Middleware
 * Logs incoming requests with method, pathname, status, and execution time.
 *
 * @returns {Middleware} - A middleware function for logging HTTP requests.
 *
 * @example
 * ```ts
 * import { logger } from 'tezx/logger';
 *
 * app.use(logger());
 * ```
 */
function logger<T extends Record<string, any> = {}, Path extends string = any>(options: { enabled: boolean } = { enabled: true }): Middleware<T, Path> {
  return async function logger(ctx, next) {
    try {
      if (!options?.enabled) {
        return next();
      }
      // Log the incoming request with method and pathname
      console.log(`${colorText("<--", "bold")} ${colorText(ctx.method, "bgMagenta")} ${ctx.pathname}`);

      const startTime = performance.now(); // Capture start time
      let n = (await next?.()) as unknown as Response; // Execute next middleware
      const elapsed = performance.now() - startTime; // Calculate elapsed time

      // Log the response with method, pathname, status, and execution time
      console.log(
        `${colorText("-->", "bold")} ${colorText(ctx.method, "bgBlue")} ${ctx.pathname} ` +
        `${colorText(ctx.res?.status ?? 404, "yellow")} ${colorText(`${elapsed.toFixed(2)}ms`, "magenta")}`,
      );
      return n; // Return response
    } catch (err: any) {
      console.error(`${colorText("Error:", "red")}`, err.stack); // Log error
      let error = err instanceof Error ? err : new Error(err);
      throw error;
    }
  };
}

export { logger as default, logger };
