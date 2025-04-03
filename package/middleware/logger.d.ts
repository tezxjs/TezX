import { Middleware } from "../core/router";
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
export declare function logger(): Middleware;
