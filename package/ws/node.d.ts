import { Context } from "../index.js";
import { WebSocketEvent, WebSocketOptions } from "./index.js";
export declare class NodeTransport {
    private wss?;
    upgrade(ctx: Context, event: WebSocketEvent, options: WebSocketOptions): Promise<(ctx: Context, server: any) => void>;
    private setupHandlers;
}
