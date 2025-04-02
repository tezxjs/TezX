import { COLORS } from "../utils/colors";
/**
 * Logger Middleware
 * Logs incoming requests with method, pathname, status, and execution time.
 *
 * @returns {Middleware} - A middleware function for logging HTTP requests.
 *
 * @example
 * ```ts
 * import { logger } from 'tezx';
 *
 * app.use(logger());
 * ```
 */
export function logger() {
    return async (ctx, next) => {
        try {
            // Log the incoming request with method and pathname
            console.log(`${COLORS.bold}<-- ${COLORS.reset}${COLORS.bgMagenta} ${ctx.method} ${COLORS.reset} ${ctx.pathname}`);
            const startTime = performance.now(); // Capture start time
            let n = await next(); // Execute next middleware
            const elapsed = performance.now() - startTime; // Calculate elapsed time
            // Log the response with method, pathname, status, and execution time
            console.log(`${COLORS.bold}--> ${COLORS.reset}${COLORS.bgBlue} ${ctx.method} ${COLORS.reset} ${ctx.pathname} ` +
                `${COLORS.yellow}${ctx.getStatus}${COLORS.reset} ${COLORS.magenta}${elapsed.toFixed(2)}ms${COLORS.reset}`);
            return n; // Return response
        }
        catch (err) {
            console.error(`${COLORS.red}Error:${COLORS.reset}`, err.stack); // Log error
            throw new Error(err.stack); // Rethrow error
        }
    };
}
