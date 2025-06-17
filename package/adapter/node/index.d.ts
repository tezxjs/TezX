import type { ServerOptions } from "node:http";
import type { TlsOptions } from "node:tls";
import { TezX } from "../../core/server.js";
type UnixSocketOptions = ServerOptions & {
    unix?: string;
    enableSSL?: false;
};
type SSLOptions = ServerOptions & TlsOptions & {
    enableSSL: true;
};
type TezXServerOptions = UnixSocketOptions | SSLOptions;
/**
 * Starts the TezX server using Node.js native `http` or `https` module based on the `enableSSL` flag.
 * - If `enableSSL` is true and valid TLS options are provided, it uses `https.createServer`.
 * - Otherwise, falls back to `http.createServer`.
 * - Optionally supports binding to a Unix domain socket via `options.unix`.
 *
 * ### Usage:
 *
 * ```ts
 * // Start with default HTTP
 * nodeAdapter(app).listen(3000, () => {
 *   console.log("Server is running");
 * });
 *
 * // Start with HTTPS
 * nodeAdapter(app, {
 *   enableSSL: true,
 *   key: fs.readFileSync("key.pem"),
 *   cert: fs.readFileSync("cert.pem")
 * }).listen(443);
 *
 * // Start with Unix socket
 * nodeAdapter(app, { unix: "/tmp/tezx.sock" }).listen();
 * ```
 * @param {number} [port] - The port number to listen on (ignored if `unix` is provided).
 * @param {() => void} [callback] - Callback invoked after the server starts listening.
 * @returns {void} Nothing is returned directly; server instance is stored in GlobalConfig.
 */
export declare function nodeAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>, options?: TezXServerOptions): {
    listen: {
        (callback?: () => void): any;
        (port?: number): any;
        (port?: number, callback?: () => void): any;
    };
};
export {};
