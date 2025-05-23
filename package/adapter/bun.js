import { GlobalConfig } from "../core/config.js";
import { Context } from "../core/context.js";
export function bunAdapter(TezX, options = {}) {
    function listen(...arg) {
        const port = typeof arg[0] === "function" ? undefined : arg[0];
        const callback = typeof arg[0] === "function" ? arg[0] : arg[1];
        const serve = typeof Bun !== "undefined" ? Bun.serve : null;
        try {
            if (!serve) {
                throw new Error("Bun is not find");
            }
            GlobalConfig.adapter = "bun";
            let server;
            server =
                options?.unix || typeof options?.unix == "string"
                    ? serve({
                        unix: options?.unix,
                        fetch: () => {
                            return new Response("4004");
                        },
                    })
                    : serve({
                        error: (error) => {
                            return options?.error?.(server, error);
                        },
                        development: options?.development,
                        hostname: options?.hostname,
                        id: options?.id,
                        idleTimeout: options?.idleTimeout,
                        ipv6Only: options?.ipv6Only,
                        maxRequestBodySize: options?.maxRequestBodySize,
                        reusePort: options?.reusePort,
                        tls: options?.tls,
                        port: options?.port || port,
                        async fetch(req) {
                            let options = {
                                connInfo: {
                                    remoteAddr: server.requestIP(req),
                                    localAddr: server.address,
                                },
                            };
                            const response = await TezX.serve(req, options);
                            if (typeof response?.websocket == "function" &&
                                response.ctx instanceof Context &&
                                response.ctx.wsProtocol) {
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
                        },
                    });
            GlobalConfig.server = server;
            const message = `\x1b[1m Bun TezX Server running at ${server.url}\x1b[0m`;
            GlobalConfig.debugging.success(message);
            if (typeof callback == "function")
                callback();
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
