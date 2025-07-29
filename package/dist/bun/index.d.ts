import { loadEnv } from "../node/env.js";
import { getConnInfo } from "./getConnInfo.js";
import upgradeWebSocket from "./ws.js";
export type { WebSocketCallback, WebSocketEvent, WebSocketOptions } from "../types/index.js";
export { getConnInfo, loadEnv, upgradeWebSocket };
declare const _default: {
    getConnInfo: typeof getConnInfo;
    loadEnv: typeof loadEnv;
    upgradeWebSocket: typeof upgradeWebSocket;
};
export default _default;
