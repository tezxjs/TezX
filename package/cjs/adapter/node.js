"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeAdapter = nodeAdapter;
const config_js_1 = require("../core/config.js");
const context_js_1 = require("../core/context.js");
function nodeAdapter(TezX) {
    function listen(port, callback) {
        Promise.resolve().then(() => require("http")).then((r) => {
            config_js_1.GlobalConfig.adapter = "node";
            let server = r.createServer(async (req, res) => {
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
                const { Readable } = await Promise.resolve().then(() => require("stream"));
                if (response.body instanceof Readable) {
                    response.body.pipe(res);
                }
                else {
                    const body = await response.arrayBuffer();
                    if (body.byteLength > 0) {
                        return res.end(Buffer.from(body));
                    }
                    res.end();
                }
            });
            server.listen(port, () => {
                const protocol = "\x1b[1;34mhttp\x1b[0m";
                const message = `\x1b[1m NodeJS TezX Server running at ${protocol}://localhost:${port}/\x1b[0m`;
                config_js_1.GlobalConfig.server = server;
                if (typeof callback == "function") {
                    callback(message);
                }
                else {
                    config_js_1.GlobalConfig.debugging.success(message);
                }
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
