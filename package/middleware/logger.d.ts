import { Middleware } from "../types/index.js";
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
declare function logger(options?: {
    enabled: boolean;
}): Middleware;
export { logger as default, logger };
