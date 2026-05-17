import { ServerResponse } from "node:http";

/**
 * Extended HTTP Response object with Express-like helpers
 */
export interface Response extends ServerResponse {
    /**
     * Send JSON response
     * @param data - Any serializable data
     */
    json: (data: any) => void;

    /**
     * Send plain text or object response
     * @param data - String or object to send
     */
    send: (data: any) => void;

    /**
     * Send file response
     * @param filePath - Absolute path of file
     */
    sendFile: (filePath: string) => void;

    /**
     * Set HTTP status code
     * @param code - HTTP status code
     */
    status: (code: number) => Response;
}