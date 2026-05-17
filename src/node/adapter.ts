import { Buffer } from "node:buffer";
import type { ServerOptions } from "node:http";
import { createServer } from "node:http";
import { createServer as sslCreateServer } from "node:https";
import type { TlsOptions } from "node:tls";
import { Context } from "../core/context.js";
import { TezX } from "../core/server.js";
import { ConnAddress } from "../types/index.js";

export type UnixSocketOptions = ServerOptions & {
  unix?: string;
  enableSSL?: false;
};

export type SSLOptions = ServerOptions &
  TlsOptions & {
    enableSSL: true;
  };

export type TezXServerOptions = UnixSocketOptions | SSLOptions;

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
export function nodeAdapter<T extends Record<string, any> = {}>(
  TezX: TezX<T>,
  options: TezXServerOptions = {},
) {
  function listen(callback?: () => void): any;
  function listen(port?: number): any;
  function listen(port?: number, callback?: () => void): any;
  function listen(...arg: any[]) {
    let ssl = options?.enableSSL;
    let createServerFn: any = ssl ? sslCreateServer : createServer;

    let server = createServerFn(options, async (req: any, res: any) => {
      let address = {};
      if (req.socket) {
        address = {
          remoteAddr: {
            family: req.socket.remoteFamily,
            address: req.socket.remoteAddress, // Client IP
            port: req.socket.remotePort, // Client Port
          },
          localAddr: {
            address: req.socket.localAddress, // Server IP
            port: req.socket.localPort, // Server Port
            family: req.socket.localFamily,
          },
        };
      }

      let options: TezXServeOptions = {
        connInfo: address as ConnAddress,
      };

      const response: any = await TezX.serve(req, options);
      // ✅ WebSocket handler
      if (
        typeof response?.websocket === "function" &&
        response.ctx instanceof Context &&
        response.ctx.wsProtocol
      ) {
        response.websocket(response.ctx, server);
        return res.end();
      }

      const statusText = response?.statusText;

      // ✅ Validate response
      if (!(response instanceof Response)) {
        throw new Error("Invalid response from TezX.serve");
      }

      if (statusText) {
        res.statusMessage = statusText;
      }

      res.writeHead(response.status, [...response.headers.entries()]);
      const { Readable } = await import("node:stream");
      // console.log(response.body?.pipeTo, response.body?.getReader)
      const body = response.body;

      if (response.headers.get("Content-Type") === "text/event-stream") {
        req.socket.setTimeout(0); // disable timeout for SSE
      }

      // ✅ 1. Node.js native stream
      if (body instanceof Readable) {
        return body.pipe(res);
      }
      // ✅ 2. Web stream (ReadableStream)
      else if (body?.pipeTo || body?.getReader) {
        try {
          return Readable.fromWeb(body as any).pipe(res);
        } catch (err) {
          GlobalConfig.debugging.warn("Failed to stream web body:", err);
          return res.end();
        }
      }

      // ✅ 3. Async Iterable (e.g., SSE or streamable generators)
      else if (typeof body?.[Symbol.asyncIterator] === "function") {
        const readable = Readable.from(body);
        return readable.pipe(res);
      } else {
        try {
          const buffer = await response.arrayBuffer?.();
          if (buffer && buffer.byteLength > 0) {
            return res.end(Buffer.from(buffer));
          } else {
            return res.end();
          }
        } catch (err) {

          const text = await response.text?.();
          return res.end(text ?? "");
        }
      }
    });

    const port = typeof arg[0] === "function" ? undefined : arg[0];
    const callback = typeof arg[0] === "function" ? arg[0] : arg[1];

    server.listen((options as any)?.unix || port || 0, () => {
      // Determine protocol based on SSL configuration
      const protocol = ssl ? "\x1b[1;35mhttps\x1b[0m" : "\x1b[1;34mhttp\x1b[0m";
      // const protocol = "\x1b[1;35mhttps\x1b[0m" : "\x1b[1;34mhttp\x1b[0m";
      // Constructing the colorful message with emojis

      const address = server.address();

      const message =
        typeof address === "string"
          ? `\x1b[1mNodeJS TezX Server running at unix://${address}\x1b[0m`
          : `\x1b[1mNodeJS TezX Server running at ${protocol}://localhost:${address?.port}/\x1b[0m`;

      // Logging the message to the console
      if (typeof callback == "function") callback();
      return server;
    });
    return server;
  }
  return {
    listen,
  };
}
