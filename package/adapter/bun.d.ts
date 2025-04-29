import { TezX } from "../core/server.js";
export declare function bunAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>, options?: {
    /**
     * If set, the HTTP server will listen on a unix socket instead of a port.
     * (Cannot be used with hostname+port)
     */
    unix: string;
} | {
    /**
     * What is the maximum size of a request body? (in bytes)
     * @default 1024 * 1024 * 128 // 128MB
     */
    maxRequestBodySize?: number;
    /**
     * Render contextual errors? This enables bun's error page
     * @default process.env.NODE_ENV !== 'production'
     */
    development?: boolean | {
        /**
         * Enable Hot Module Replacement for routes (including React Fast Refresh, if React is in use)
         *
         * @default true if process.env.NODE_ENV !== 'production'
         *
         */
        hmr?: boolean;
    };
    error?: (s: Bun.Serve, error: Error) => Response | Promise<Response> | void | Promise<void>;
    /**
     * Uniquely identify a server instance with an ID
     *
     * ### When bun is started with the `--hot` flag
     *
     * This string will be used to hot reload the server without interrupting
     * pending requests or websockets. If not provided, a value will be
     * generated. To disable hot reloading, set this value to `null`.
     *
     * ### When bun is not started with the `--hot` flag
     *
     * This string will currently do nothing. But in the future it could be useful for logs or metrics.
     */
    id?: string | null;
    /**
     * What port should the server listen on?
     * @default process.env.PORT || "3000"
     */
    port?: string | number;
    /**
     * Whether the `SO_REUSEPORT` flag should be set.
     *
     * This allows multiple processes to bind to the same port, which is useful for load balancing.
     *
     * @default false
     */
    reusePort?: boolean;
    /**
     * Whether the `IPV6_V6ONLY` flag should be set.
     * @default false
     */
    ipv6Only?: boolean;
    /**
     * What hostname should the server listen on?
     *
     * @default
     * ```js
     * "0.0.0.0" // listen on all interfaces
     * ```
     * @example
     *  ```js
     * "127.0.0.1" // Only listen locally
     * ```
     * @example
     * ```js
     * "remix.run" // Only listen on remix.run
     * ````
     *
     * note: hostname should not include a {@link port}
     */
    hostname?: string;
    /**
     * If set, the HTTP server will listen on a unix socket instead of a port.
     * (Cannot be used with hostname+port)
     */
    unix?: never;
    /**
     * Sets the the number of seconds to wait before timing out a connection
     * due to inactivity.
     *
     * Default is `10` seconds.
     */
    idleTimeout?: number;
    tls?: Bun.TLSOptions | Bun.TLSOptions[];
}): {
    listen: {
        (callback?: (message: string) => void): any;
        (port?: number): any;
        (port?: number, callback?: (message: string) => void): any;
    };
};
