"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bunAdapter = bunAdapter;
const config_js_1 = require("../core/config.js");
const context_js_1 = require("../core/context.js");
function bunAdapter(TezX) {
    function listen(port, callback) {
        const serve = typeof Bun !== "undefined" ? Bun.serve : null;
        try {
            if (!serve) {
                throw new Error("Bun is not find");
            }
            config_js_1.GlobalConfig.adapter = "bun";
            const server = serve({
                port: port,
                async fetch(req) {
                    let options = {
                        connInfo: {
                            remoteAddr: server.requestIP(req),
                            localAddr: server.address,
                        },
                    };
                    const response = await TezX.serve(req, options);
                    if (typeof response?.websocket == "function" && response.ctx instanceof context_js_1.Context && response.ctx.wsProtocol) {
                        let websocket = response?.websocket(response?.ctx);
                        const upgradeSuccess = server.upgrade(req, {
                            data: { ...websocket },
                        });
                        if (upgradeSuccess)
                            return undefined;
                    }
                    if (response instanceof Response) {
                        return response;
                    }
                    return new Response(response.body ?? null, {
                        status: response.status ?? 200,
                        statusText: response.statusText || "",
                        headers: new Headers(response.headers ?? {}),
                    });
                },
                websocket: {
                    open(ws) {
                        return ws.data?.open?.(ws);
                    },
                    message(ws, msg) {
                        return ws.data?.message?.(ws, msg);
                    },
                    close(ws, code, reason) {
                        return ws.data?.close?.(ws, { code, reason });
                    },
                    ping(ws, data) {
                        return ws.data?.ping?.(ws, data);
                    },
                    pong(ws, data) {
                        return ws.data?.pong?.(ws, data);
                    },
                    drain(ws) {
                        return ws.data?.drain?.(ws);
                    },
                }
            });
            config_js_1.GlobalConfig.server = server;
            const protocol = "\x1b[1;34mhttp\x1b[0m";
            const message = `\x1b[1m Bun TezX Server running at ${protocol}://localhost:${port}/\x1b[0m`;
            if (typeof callback == "function") {
                callback(message);
            }
            else {
                config_js_1.GlobalConfig.debugging.success(message);
            }
            return server;
        }
        catch (err) {
            throw new Error(err?.message);
        }
    }
    return {
        listen,
    };
}
