import { IncomingMessage } from "node:http";
import { ExtractParamsFromPath } from ".";

/**
 * Extended HTTP Request object with Express-like properties
 */
export interface Request<T extends Record<string, any> = {}, Path extends string = any> extends IncomingMessage {
    /**
     * Parsed request body (JSON or form data)
     */
    body?: any;

    /**
     * URL query parameters (?id=1)
     */
    query?: Record<string, any>; //!done

    /**
       * Route parameters extracted from the path.
       * @type {ExtractParamsFromPath<Path>}
       */
    readonly params: ExtractParamsFromPath<Path>;

    /**
     * Full parsed URL path
     */
    path?: string;

    /**
     * HTTP method (GET, POST, etc.)
     */
    method: string;

    /**
     * Original request URL
     */
    url: string;

    /**
     * Headers object
     */
    headers: IncomingMessage["headers"];
}