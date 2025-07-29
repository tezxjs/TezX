import { loadEnv } from "./env.js";
import { getConnInfo } from "./getConnInfo.js";
import { mountTezXOnNode } from "./mount-node.js";
import { toWebRequest } from "./toWebRequest.js";
import { upgradeWebSocket } from "./ws.js";
export type { nodeWebSocketOptions, } from "./ws.js";
export type { WebSocketCallback, WebSocketEvent, WebSocketOptions } from "../types/index.js";
export { upgradeWebSocket, getConnInfo, toWebRequest, loadEnv, mountTezXOnNode };
declare const _default: {
    upgradeWebSocket: typeof upgradeWebSocket;
    mountTezXOnNode: typeof mountTezXOnNode;
    toWebRequest: typeof toWebRequest;
    getConnInfo: typeof getConnInfo;
    loadEnv: typeof loadEnv;
};
export default _default;
