import { Readable } from "node:stream";
import { GlobalConfig } from "../core/config.js";
import { toWebRequest } from "./toWebRequest.js";
function readableStreamToNodeStream(stream) {
    const reader = stream.getReader();
    return new Readable({
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
export function mountTezXOnNode(app, server) {
    server.on("request", async (req, res) => {
        try {
            const request = toWebRequest(req, req.method);
            const response = await app.serve(request, req, res, server);
            if (res.writableEnded || res.headersSent)
                return;
            const { status = 200, statusText = "", headers = {}, body } = response;
            const nodeHeaders = Object.fromEntries(headers instanceof Headers
                ? headers.entries()
                : Object.entries(headers));
            res.writeHead(status, statusText, nodeHeaders);
            if (!body) {
                return res.end();
            }
            if (body instanceof Readable) {
                return body.pipe(res);
            }
            if (typeof body.getReader === "function") {
                return (Readable.fromWeb?.(body)?.pipe?.(res) ??
                    readableStreamToNodeStream(body).pipe(res));
            }
            res.end(body);
        }
        catch (err) {
            res.statusCode = 500;
            GlobalConfig.debugging?.error?.(err?.message || "Unknown error");
            res.end(err?.message || "Internal Server Error");
        }
    });
}
