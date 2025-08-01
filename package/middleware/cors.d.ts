import { Ctx } from "../types/index.js";
export type CorsOptions = {
    /**
     * Allowed origins for CORS.
     * Can be a string, a RegExp, an array of strings or RegExps, or a function
     * that takes the request origin and returns a boolean indicating if it is allowed.
     */
    origin?: string | RegExp | (string | RegExp)[] | ((reqOrigin: string) => boolean);
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
     * Indicates whether the response to the request can be exposed
     * when the credentials flag is true.
     */
    credentials?: boolean;
    /**
     * Indicates how long the results of a preflight request
     * can be cached (in seconds).
     */
    maxAge?: number;
};
/**
 * Middleware for handling Cross-Origin Resource Sharing (CORS).
 *
 * @param {CorsOptions} [option={}] - Configuration options for CORS.
 * @returns {Function} Middleware function compatible with the framework's middleware signature.
 *
 * @example
 * ```ts
 * app.use(cors({
 *   origin: ["https://example.com", /https:\/\/.*\.example\.com/],
 *   methods: ["GET", "POST"],
 *   credentials: true,
 *   maxAge: 600,
 * }));
 * ```
 */
declare function cors(option?: CorsOptions): (ctx: Ctx, next: () => Promise<any>) => Promise<any>;
export { cors, cors as default };
