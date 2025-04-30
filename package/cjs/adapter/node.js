"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeAdapter = nodeAdapter;
const node_buffer_1 = require("node:buffer");
const config_js_1 = require("../core/config.js");
const context_js_1 = require("../core/context.js");
function nodeAdapter(TezX, options = {}) {
    function listen(...arg) {
        let ssl = options?.enableSSL;
        Promise.resolve(`${ssl ? "node:https" : 'node:http'}`).then(s => require(s)).then((r) => {
            config_js_1.GlobalConfig.adapter = "node";
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
                    response.ctx instanceof context_js_1.Context &&
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
                const headers = Object.fromEntries(await response.headers.entries());
                if (statusText) {
                    res.statusMessage = statusText;
                }
                res.writeHead(response.status, headers);
                const { Readable } = await Promise.resolve().then(() => require("node:stream"));
                if (response.body instanceof Readable) {
                    return response.body.pipe(res);
                }
                else {
                    const buffer = await response.arrayBuffer();
                    if (buffer.byteLength > 0) {
                        return res.end(node_buffer_1.Buffer.from(buffer));
                    }
                    else {
                        return res.end();
                    }
                }
            });
            const port = typeof arg[0] === "number" ? arg[0] : undefined;
            const callback = typeof arg[0] === "function" ? arg[0] : arg[1];
            server.listen(options?.unix || port || 0, () => {
                const protocol = ssl ? "\x1b[1;35mhttps\x1b[0m" : "\x1b[1;34mhttp\x1b[0m";
                const address = server.address();
                const message = typeof address === "string"
                    ? `\x1b[1mNodeJS TezX Server running at unix://${address}\x1b[0m`
                    : `\x1b[1mNodeJS TezX Server running at ${protocol}://localhost:${address?.port}/\x1b[0m`;
                config_js_1.GlobalConfig.server = server;
                config_js_1.GlobalConfig.debugging.success(message);
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
