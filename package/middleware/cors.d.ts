import { Middleware } from "../types/index.js";
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
declare function cors<T extends Record<string, any> = {}, Path extends string = any>(option?: CorsOptions): Middleware<T, Path>;
export { cors, cors as default };
