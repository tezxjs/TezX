import { Context } from "../core/context.js";
import { HttpBaseResponse } from "../types/index.js";
export declare let notFoundResponse: (ctx: Context) => HttpBaseResponse;
export declare function handleErrorResponse(message: Error | undefined, ctx: Context): Promise<HttpBaseResponse>;
export declare function determineContentTypeBody(body: any): {
    type: string;
    body: any;
};
