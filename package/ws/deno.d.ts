import { Context } from "../index.js";
import { WebSocketOptions, WebSocketEvent } from "./index.js";
export declare class DenoTransport {
    upgrade(ctx: Context, event: WebSocketEvent, options: WebSocketOptions): Promise<Response>;
    private setupHandlers;
}
