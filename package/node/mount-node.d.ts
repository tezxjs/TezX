import { TezX } from "../core/server.js";
/**
 * Mounts a TezX app onto a native Node.js HTTP server.
 *
 * This bridges a TezX application (typically used in a Fetch API environment) with a native
 * Node.js HTTP server by adapting the request/response interface and handling stream piping.
 *
 * @param {TezX} app - The TezX app instance that handles incoming requests and returns a Response object.
 * @param {import('http').Server} server - A native Node.js HTTP server instance to attach the TezX handler to.
 */
export declare function mountTezXOnNode(app: TezX, server: any): void;
