"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoAdapter = denoAdapter;
exports.bunAdapter = bunAdapter;
exports.nodeAdapter = nodeAdapter;
//src/adapter.ts
const config_1 = require("./config/config");
function denoAdapter(TezX) {
    async function handleRequest(req, x) {
        const response = await TezX.serve(req);
        if (response instanceof Response) {
            return response;
        }
        else {
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText || "",
                headers: new Headers(response.headers),
            });
        }
    }
    function listen(port, callback) {
        const isDeno = typeof Deno !== "undefined";
        try {
            const server = isDeno ? Deno.serve({ port }, handleRequest) : null;
            if (!server) {
                throw new Error("Deno is not find");
            }
            // Determine protocol based on SSL configuration
            const protocol = "\x1b[1;34mhttp\x1b[0m";
            // Constructing the colorful message with emojis
            const message = `\x1b[1m🚀 Deno TezX Server running at ${protocol}://localhost:${port}/\x1b[0m`;
            // Logging the message to the console
            if (typeof callback === "function") {
                callback(message);
            }
            else {
                config_1.GlobalConfig.debugging.success(message);
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
function bunAdapter(TezX) {
    function listen(port, callback) {
        const serve = typeof Bun !== "undefined" ? Bun.serve : null;
        try {
            if (!serve) {
                throw new Error("Bun is not find");
            }
            const server = serve({
                port: port,
                async fetch(req) {
                    // console.log(server.requestIP(req))
                    const response = await TezX.serve(req);
                    if (response instanceof Response) {
                        return response;
                    }
                    else {
                        return new Response(response.body, {
                            status: response.status,
                            statusText: response.statusText || "",
                            headers: new Headers(response.headers),
                        });
                    }
                },
            });
            // Determine protocol based on SSL configuration
            const protocol = "\x1b[1;34mhttp\x1b[0m";
            // const protocol = "\x1b[1;35mhttps\x1b[0m" : "\x1b[1;34mhttp\x1b[0m";
            // Constructing the colorful message with emojis
            const message = `\x1b[1m Bun TezX Server running at ${protocol}://localhost:${port}/\x1b[0m`;
            // Logging the message to the console
            if (typeof callback == "function") {
                callback(message);
            }
            else {
                config_1.GlobalConfig.debugging.success(message);
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
function nodeAdapter(TezX) {
    function listen(port, callback) {
        Promise.resolve().then(() => require("http")).then((r) => {
            let server = r.createServer(async (req, res) => {
                const response = await TezX.serve(req);
                // console.log((req as any).socket.remoteAddress)
                const statusText = response?.statusText;
                if (!(response instanceof Response)) {
                    throw new Error("Invalid response from TezX.serve");
                }
                const headers = Object.fromEntries(await response.headers.entries());
                // const body = await response.text(); // Ensure it's a string
                if (statusText) {
                    res.statusMessage = statusText;
                }
                res.writeHead(response.status, headers);
                const { Readable } = await Promise.resolve().then(() => require("stream"));
                if (response.body instanceof Readable) {
                    // Stream the body (e.g., for large files or binary data)
                    response.body.pipe(res);
                }
                else {
                    // Convert body to text or buffer
                    const body = await response.arrayBuffer();
                    res.end(Buffer.from(body));
                }
            });
            server.listen(port, () => {
                // Determine protocol based on SSL configuration
                const protocol = "\x1b[1;34mhttp\x1b[0m";
                // const protocol = "\x1b[1;35mhttps\x1b[0m" : "\x1b[1;34mhttp\x1b[0m";
                // Constructing the colorful message with emojis
                const message = `\x1b[1m NodeJS TezX Server running at ${protocol}://localhost:${port}/\x1b[0m`;
                // Logging the message to the console
                if (typeof callback == "function") {
                    callback(message);
                }
                else {
                    config_1.GlobalConfig.debugging.success(message);
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
