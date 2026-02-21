import { Context } from "../index.js";
import { HttpBaseResponse, ResponseHeaders } from "../types/index.js";
export declare let notFoundResponse: (ctx: Context) => HttpBaseResponse;
export declare function mergeHeaders(existing?: Headers, init?: ResponseHeaders): Headers;
export declare function handleErrorResponse(err: Error | undefined, ctx: Context): Promise<HttpBaseResponse>;
