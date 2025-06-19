import { Buffer } from "node:buffer";
import { createServer } from "node:http";
import { createServer as sslCreateServer } from "node:https";
import { GlobalConfig } from "../core/config.js";
import { Context } from "../core/context.js";
export function nodeAdapter(TezX, options = {}) {
    function listen(...arg) {
        let ssl = options?.enableSSL;
        let createServerFn = ssl ? sslCreateServer : createServer;
        GlobalConfig.adapter = "node";
        let server = createServerFn(options, async (req, res) => {
            let address = {};
            if (req.socket) {
                address = {
                    remoteAddr: {
                        family: req.socket.remoteFamily,
                        address: req.socket.remoteAddress,
                        port: req.socket.remotePort,
                    },
                    localAddr: {
                        address: req.socket.localAddress,
                        port: req.socket.localPort,
                        family: req.socket.localFamily,
                    },
                };
            }
            let options = {
                connInfo: address,
            };
            const response = await TezX.serve(req, options);
            if (typeof response?.websocket === "function" &&
                response.ctx instanceof Context &&
                response.ctx.wsProtocol) {
                response.websocket(response.ctx, server);
                return res.end();
            }
            const statusText = response?.statusText;
            if (!(response instanceof Response)) {
                throw new Error("Invalid response from TezX.serve");
            }
            if (statusText) {
                res.statusMessage = statusText;
            }
            res.writeHead(response.status, [...response.headers.entries()]);
            const { Readable } = await import("node:stream");
            const body = response.body;
            if (response.headers.get("Content-Type") === "text/event-stream") {
                req.socket.setTimeout(0);
            }
            if (body instanceof Readable) {
                return body.pipe(res);
            }
            else if (body?.pipeTo || body?.getReader) {
                try {
                    return Readable.fromWeb(body).pipe(res);
                }
                catch (err) {
                    GlobalConfig.debugging.warn("Failed to stream web body:", err);
                    return res.end();
                }
            }
            else if (typeof body?.[Symbol.asyncIterator] === "function") {
                const readable = Readable.from(body);
                return readable.pipe(res);
            }
            else {
                try {
                    const buffer = await response.arrayBuffer?.();
                    if (buffer && buffer.byteLength > 0) {
                        return res.end(Buffer.from(buffer));
                    }
                    else {
                        return res.end();
                    }
                }
                catch (err) {
                    GlobalConfig.debugging.warn("Body extraction failed, trying text fallback...");
                    const text = await response.text?.();
                    return res.end(text ?? "");
                }
            }
        });
        const port = typeof arg[0] === "function" ? undefined : arg[0];
        const callback = typeof arg[0] === "function" ? arg[0] : arg[1];
        server.listen(options?.unix || port || 0, () => {
            const protocol = ssl ? "\x1b[1;35mhttps\x1b[0m" : "\x1b[1;34mhttp\x1b[0m";
            const address = server.address();
            const message = typeof address === "string"
                ? `\x1b[1mNodeJS TezX Server running at unix://${address}\x1b[0m`
                : `\x1b[1mNodeJS TezX Server running at ${protocol}://localhost:${address?.port}/\x1b[0m`;
            GlobalConfig.server = server;
            GlobalConfig.debugging.success(message);
            if (typeof callback == "function")
                callback();
            return server;
        });
        return server;
    }
    return {
        listen,
    };
}
