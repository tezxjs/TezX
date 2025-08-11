import { Context } from "../core/context.js";
import { HttpBaseResponse, ResponseHeaders, ResponseInit } from "../types/index.js";
export declare let notFoundResponse: (ctx: Context) => HttpBaseResponse;
export declare function handleErrorResponse(message: Error | undefined, ctx: Context): Promise<HttpBaseResponse>;
export declare function determineContentTypeBody(body: any): {
    type: string;
    body: any;
};
/**
 * Creates a Response object with minimal GC overhead.
 * Merges only once and supports a forced Content-Type.
 *
 * @param {BodyInit} body - The body content.
 * @param {string} type - The Content-Type header.
 * @param {ResponseInit} init - Optional ResponseInit.
 * @param {ResponseHeader} baseHeaders - Default headers from the class.
 * @param {number} defaultStatus - Default status from the class.
 * @returns {Response}
 */
export declare function newResponse(body: BodyInit | null, type: string, init: ResponseInit | undefined, baseHeaders: ResponseHeaders, defaultStatus: number): Response;
