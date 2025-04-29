import { GlobalConfig } from "../core/config.js";
export function denoAdapter(TezX, options = {}) {
    function listen(...arg) {
        let port = typeof arg?.[0] === "number" ? arg?.[0] : undefined;
        let callback = typeof arg[0] == "function" ? arg[0] : arg?.[1];
        const isDeno = typeof Deno !== "undefined";
        try {
            async function handleRequest(req, connInfo) {
                let remoteAddr = connInfo.remoteAddr;
                let localAddr = { ...server?.addr };
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
                let options = {
                    connInfo: address,
                };
                const response = await TezX.serve(req, options);
                if (response instanceof Response) {
                    return response;
                }
                return new Response(response.body ?? null, {
                    status: response.status ?? 200,
                    statusText: response.statusText || "",
                    headers: new Headers(response.headers ?? {}),
                });
            }
            const server = isDeno
                ? options.transport === "unix"
                    ? Deno.serve(options, handleRequest)
                    : Deno.serve({ ...options, port }, handleRequest)
                : null;
            if (!server) {
                throw new Error("Deno is not find");
            }
            GlobalConfig.adapter = "deno";
            GlobalConfig.server = server;
            const protocol = `\x1b[1;34m${options?.cert && options?.key ? "https" : "http"}\x1b[0m`;
            const message = options?.transport !== "unix"
                ? `\x1b[1m🚀 Deno TezX Server running at ${protocol}://${(server?.addr).hostname}:${server?.addr?.port}/\x1b[0m`
                : `\x1b[1m🚀 Deno TezX Server running at ${server?.addr?.transport}://${server?.addr?.path}\x1b[0m`;
            GlobalConfig.debugging.success(message);
            if (typeof callback === "function")
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
