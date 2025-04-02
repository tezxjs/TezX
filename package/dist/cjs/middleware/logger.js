"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = logger;
const colors_1 = require("../utils/colors");
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
function logger() {
    return async (ctx, next) => {
        try {
            // Log the incoming request with method and pathname
            console.log(`${colors_1.COLORS.bold}<-- ${colors_1.COLORS.reset}${colors_1.COLORS.bgMagenta} ${ctx.method} ${colors_1.COLORS.reset} ${ctx.pathname}`);
            const startTime = performance.now(); // Capture start time
            let n = await next(); // Execute next middleware
            const elapsed = performance.now() - startTime; // Calculate elapsed time
            // Log the response with method, pathname, status, and execution time
            console.log(`${colors_1.COLORS.bold}--> ${colors_1.COLORS.reset}${colors_1.COLORS.bgBlue} ${ctx.method} ${colors_1.COLORS.reset} ${ctx.pathname} ` +
                `${colors_1.COLORS.yellow}${ctx.getStatus}${colors_1.COLORS.reset} ${colors_1.COLORS.magenta}${elapsed.toFixed(2)}ms${colors_1.COLORS.reset}`);
            return n; // Return response
        }
        catch (err) {
            console.error(`${colors_1.COLORS.red}Error:${colors_1.COLORS.reset}`, err.stack); // Log error
            throw new Error(err.stack); // Rethrow error
        }
    };
}
