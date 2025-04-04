import { HTTPMethod } from "./request";
import { Middleware, Router, RouterConfig } from "./router";
interface ServeResponse {
    status: number;
    headers: {
        [key: string]: string;
    };
    body: string;
    statusText: string;
}
export type TezXConfig = {
    /**
     * `allowDuplicateMw` determines whether duplicate middleware functions
     * are allowed in the router.
     *
     * - When `true`: The same middleware can be added multiple times.
     * - When `false`: Ensures each middleware is registered only once
     *   per route or application context.
     *
     * @default false
     */
    allowDuplicateMw?: boolean;
    /**
     * `overwriteMethod` controls whether existing route handlers
     * should be overwritten when a new handler for the same
     * HTTP method and path is added.
     *
     * - When `true`: The new handler replaces the existing one.
     * - When `false`: Prevents overwriting, ensuring that the
     *   first registered handler remains active.
     *
     * @default true
     */
    overwriteMethod?: boolean;
    /**
     * Enables or disables debugging for the middleware.
     * When set to `true`, detailed debug logs will be output,
     * useful for tracking the flow of requests and identifying issues.
     *
     * @default false
     */
    debugMode?: boolean;
} & RouterConfig;
export declare class TezX<T extends Record<string, any> = {}> extends Router<T> {
    #private;
    constructor({ basePath, env, debugMode, allowDuplicateMw, overwriteMethod, }?: TezXConfig);
    protected findRoute(method: HTTPMethod, pathname: string): {
        callback: any;
        middlewares: Middleware<T>[];
        params: Record<string, string>;
    } | null;
    serve(req: Request, connInfo: any): Promise<ServeResponse | any>;
}
export {};
