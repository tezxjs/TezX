import { IncomingMessage } from "node:http";
/**
 * Convert Node.js IncomingMessage to a standard Web Fetch API Request with full support:
 * - Absolute URL resolution
 * - Streaming body (duplex)
 * - AbortSignal linked to client disconnect
 *
 * @param {IncomingMessage} req Node.js HTTP request object
 * @returns {Request} Web Fetch API Request instance
 */
export declare function toWebRequest(req: IncomingMessage, method?: string): Request;
