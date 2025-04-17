import { Context } from "./context.js";
import { Callback, ctx } from "./router.js";
export interface option {
    status?: number;
}
export type onError<T> = (error: string, ctx: Context) => void;
export declare class CommonHandler {
    /**
     * Register a custom 404 handler for missing routes
     * @param {Callback} callback - Handler function to execute when no route matches
     * @returns {this} - Returns current instance for chaining
     *
     * @example
     * // Register a custom not-found handler
     * app.notFound((ctx) => {
     *   ctx.status(404).text('Custom not found message');
     * });
     */
    notFound(callback: Callback): this;
    onError(callback: <T extends Record<string, any> = {}>(err: string, ctx: ctx<T>) => any): this;
}
