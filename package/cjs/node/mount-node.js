"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountTezXOnNode = mountTezXOnNode;
const node_stream_1 = require("node:stream");
const config_js_1 = require("../core/config.js");
const toWebRequest_js_1 = require("./toWebRequest.js");
function readableStreamToNodeStream(stream) {
    const reader = stream.getReader();
    return new node_stream_1.Readable({
        async read() {
            try {
                const { done, value } = await reader.read();
                if (done) {
                    this.push(null);
                }
                else {
                    this.push(value);
                }
            }
            catch (err) {
                this.destroy(err);
            }
        },
        destroy(err, callback) {
            reader.cancel().then(() => callback(err), (cancelErr) => callback(cancelErr));
        },
    });
}
function mountTezXOnNode(app, server) {
    server.on('request', async (req, res) => {
        try {
            const request = (0, toWebRequest_js_1.toWebRequest)(req, req.method);
            const response = await app.serve(request, req, res, server);
            if (res.writableEnded || res.headersSent)
                return;
            const { status = 200, statusText = '', headers = {}, body } = response;
            const nodeHeaders = Object.fromEntries(headers instanceof Headers ? headers.entries() : Object.entries(headers));
            res.writeHead(status, statusText, nodeHeaders);
            if (!body) {
                return res.end();
            }
            if (body instanceof node_stream_1.Readable) {
                return body.pipe(res);
            }
            if (typeof body.getReader === 'function') {
                return node_stream_1.Readable.fromWeb?.(body)?.pipe?.(res) ?? readableStreamToNodeStream(body).pipe(res);
            }
            res.end(body);
        }
        catch (err) {
            res.statusCode = 500;
            config_js_1.GlobalConfig.debugging?.error?.(err?.message || 'Unknown error');
            res.end(err?.message || 'Internal Server Error');
        }
    });
}
