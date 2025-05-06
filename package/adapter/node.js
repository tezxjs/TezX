import { Buffer } from "node:buffer";
import { GlobalConfig } from "../core/config.js";
import { Context } from "../core/context.js";
export function nodeAdapter(TezX, options = {}) {
    function listen(...arg) {
        let ssl = options?.enableSSL;
        import(ssl ? "node:https" : "node:http")
            .then((r) => {
            GlobalConfig.adapter = "node";
            let server = r.createServer(options, async (req, res) => {
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
                if (typeof response?.websocket == "function" &&
                    response.ctx instanceof Context &&
                    response.ctx.wsProtocol) {
                    let ctx = response.ctx;
                    response.websocket(ctx, server);
                    res.end();
                    return;
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
                if (response.body instanceof Readable) {
                    return response.body.pipe(res);
                }
                else {
                    const buffer = await response.arrayBuffer();
                    if (buffer.byteLength > 0) {
                        return res.end(Buffer.from(buffer));
                    }
                    else {
                        return res.end();
                    }
                }
            });
            const port = typeof arg[0] === "function" ? undefined : arg[0];
            const callback = typeof arg[0] === "function" ? arg[0] : arg[1];
            server.listen(options?.unix || port || 0, () => {
                const protocol = ssl
                    ? "\x1b[1;35mhttps\x1b[0m"
                    : "\x1b[1;34mhttp\x1b[0m";
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
        })
            .catch((r) => {
            throw Error(r.message);
        });
    }
    return {
        listen,
    };
}
