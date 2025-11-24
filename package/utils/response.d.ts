import { Context } from "../core/context.js";
import { HttpBaseResponse, ResponseHeaders } from "../types/index.js";
export declare let notFoundResponse: (ctx: Context) => HttpBaseResponse;
export declare function mergeHeaders(existing?: Headers, initHeaders?: ResponseHeaders): Headers;
export declare function handleErrorResponse(err: Error | undefined, ctx: Context): Promise<HttpBaseResponse>;
