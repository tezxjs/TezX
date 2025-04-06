import { GlobalConfig } from "../core/config";
export function denoAdapter(TezX) {
    function listen(port, callback) {
        const isDeno = typeof Deno !== "undefined";
        try {
            async function handleRequest(req, connInfo) {
                let remoteAddr = connInfo.remoteAddr;
                let localAddr = { ...server.addr };
                let address = {
                    remoteAddr: {
                        port: remoteAddr?.port,
                        address: remoteAddr?.hostname,
                        transport: remoteAddr?.transport,
                        family: remoteAddr?.family,
                    },
                    localAddr: {
                        port: localAddr?.port,
                        address: localAddr?.hostname,
                        transport: localAddr?.transport,
                        family: localAddr?.family,
                    },
                };
                const response = await TezX.serve(req, address);
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
            const server = isDeno ? Deno.serve({ port }, handleRequest) : null;
            GlobalConfig.serverInfo = server;
            if (!server) {
                throw new Error("Deno is not find");
            }
            const protocol = "\x1b[1;34mhttp\x1b[0m";
            const message = `\x1b[1m🚀 Deno TezX Server running at ${protocol}://localhost:${port}/\x1b[0m`;
            if (typeof callback === "function") {
                callback(message);
            }
            else {
                GlobalConfig.debugging.success(message);
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
export function bunAdapter(TezX) {
    function listen(port, callback) {
        const serve = typeof Bun !== "undefined" ? Bun.serve : null;
        try {
            if (!serve) {
                throw new Error("Bun is not find");
            }
            const server = serve({
                port: port,
                async fetch(req) {
                    const response = await TezX.serve(req, {
                        remoteAddr: server.requestIP(req),
                        localAddr: server.address,
                    });
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
            GlobalConfig.serverInfo = server;
            const protocol = "\x1b[1;34mhttp\x1b[0m";
            const message = `\x1b[1m Bun TezX Server running at ${protocol}://localhost:${port}/\x1b[0m`;
            if (typeof callback == "function") {
                callback(message);
            }
            else {
                GlobalConfig.debugging.success(message);
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
export function nodeAdapter(TezX) {
    function listen(port, callback) {
        import("http")
            .then((r) => {
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
                const response = await TezX.serve(req, address);
                const statusText = response?.statusText;
                if (!(response instanceof Response)) {
                    throw new Error("Invalid response from TezX.serve");
                }
                const headers = Object.fromEntries(await response.headers.entries());
                if (statusText) {
                    res.statusMessage = statusText;
                }
                res.writeHead(response.status, headers);
                const { Readable } = await import("stream");
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
                GlobalConfig.serverInfo = server;
                if (typeof callback == "function") {
                    callback(message);
                }
                else {
                    GlobalConfig.debugging.success(message);
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
