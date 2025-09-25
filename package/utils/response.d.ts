import { Context } from "../core/context.js";
import { TezXError } from "../core/error.js";
import { HttpBaseResponse } from "../types/index.js";
export declare let notFoundResponse: (ctx: Context) => HttpBaseResponse;
export declare function handleErrorResponse(err: TezXError | undefined, ctx: Context): Promise<HttpBaseResponse>;
/**
 * Converts a template literal array and values into a single string.
 * If a plain string is passed, it returns the string itself.
 *
 * @param input - A string or a template literal array.
 * @param values - Values for template literal placeholders.
 * @returns Concatenated string.
 */
export declare function toString(input: string | readonly string[], values: any[]): string;
export declare function determineContentTypeBody(body: any): {
    type: string;
    body: any;
};
