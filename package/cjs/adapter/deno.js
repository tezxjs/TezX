"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.denoAdapter = denoAdapter;
const config_js_1 = require("../core/config.js");
function denoAdapter(TezX) {
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
      const server = isDeno ? Deno.serve({ port }, handleRequest) : null;
      if (!server) {
        throw new Error("Deno is not find");
      }
      config_js_1.GlobalConfig.adapter = "deno";
      config_js_1.GlobalConfig.server = server;
      const protocol = "\x1b[1;34mhttp\x1b[0m";
      const message = `\x1b[1m🚀 Deno TezX Server running at ${protocol}://localhost:${port}/\x1b[0m`;
      if (typeof callback === "function") {
        callback(message);
      } else {
        config_js_1.GlobalConfig.debugging.success(message);
      }
      return server;
    } catch (err) {
      throw new Error(err?.message);
    }
  }
  return {
    listen,
  };
}
