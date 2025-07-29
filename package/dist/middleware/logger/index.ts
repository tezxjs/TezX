import { Middleware } from "../../types/index.js";
import { colorText } from "../../utils/colors.js";

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
function logger(): Middleware {
    return async function logger(ctx, next) {
        try {
            // Log the incoming request with method and pathname
            console.log(
                `${colorText("<--", "bold")} ${colorText(ctx.method, "bgMagenta")} ${ctx.pathname}`,
            );

            const startTime = performance.now(); // Capture start time
            let n = await next(); // Execute next middleware
            const elapsed = performance.now() - startTime; // Calculate elapsed time

            // Log the response with method, pathname, status, and execution time
            console.log(
                `${colorText("-->", "bold")} ${colorText(ctx.method, "bgBlue")} ${ctx.pathname} ` +
                `${colorText(ctx.getStatus, "yellow")} ${colorText(`${elapsed.toFixed(2)}ms`, "magenta")}`,
            );

            return n; // Return response
        } catch (err: any) {
            console.error(`${colorText("Error:", "red")}`, err.stack); // Log error
            throw new Error(err.stack); // Rethrow error
        }
    };
}


export {
    logger, logger as default,
}