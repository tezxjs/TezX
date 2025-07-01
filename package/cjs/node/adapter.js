"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeAdapter = nodeAdapter;
const node_buffer_1 = require("node:buffer");
const node_http_1 = require("node:http");
const node_https_1 = require("node:https");
const config_js_1 = require("../core/config.js");
const context_js_1 = require("../core/context.js");
function nodeAdapter(TezX, options = {}) {
    function listen(...arg) {
        let ssl = options?.enableSSL;
        let createServerFn = ssl ? node_https_1.createServer : node_http_1.createServer;
        config_js_1.GlobalConfig.adapter = "node";
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
                response.ctx instanceof context_js_1.Context &&
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
            const { Readable } = await Promise.resolve().then(() => __importStar(require("node:stream")));
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
                    config_js_1.GlobalConfig.debugging.warn("Failed to stream web body:", err);
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
                        return res.end(node_buffer_1.Buffer.from(buffer));
                    }
                    else {
                        return res.end();
                    }
                }
                catch (err) {
                    config_js_1.GlobalConfig.debugging.warn("Body extraction failed, trying text fallback...");
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
            config_js_1.GlobalConfig.server = server;
            config_js_1.GlobalConfig.debugging.success(message);
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
