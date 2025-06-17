import { TezX } from "../core/server.js";
/**
 * Starts the TezX server using Deno's built-in serve APIs.
 *
 * Automatically selects between Unix socket and TCP server based on options.
 * Supports TLS if TLS options are provided.
 *
 * ### Usage examples:
 * ```ts
 * // Start TCP server on port 3000
 * denoAdapter(app).listen(3000, () => {
 *   console.log("Server running on port 3000");
 * });
 *
 * // Start Unix socket server
 * denoAdapter(app, { transport: "unix", path: "/tmp/tezx.sock" }).listen(() => {
 *   console.log("Server running on unix socket");
 * });
 *
 * // With TLS
 * denoAdapter(app, {
 *   port: 443,
 *   cert: Deno.readTextFileSync("./cert.pem"),
 *   key: Deno.readTextFileSync("./key.pem"),
 * }).listen();
 * ```
 *
 * @param {number} [port] - TCP port number to listen on (ignored if using Unix socket).
 * @param {(message: string) => void} [callback] - Optional callback invoked after server starts.
 * @returns {Deno.Listener | Deno.Server | null} Returns the server instance or null if Deno runtime is not detected.
 */
export declare function denoAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>, options?: Deno.ServeUnixOptions | Deno.ServeTcpOptions | (Deno.ServeTcpOptions & Deno.TlsCertifiedKeyPem)): {
    listen: {
        (callback?: (message: string) => void): any;
        (port?: number): any;
        (port?: number, callback?: (message: string) => void): any;
    };
};
