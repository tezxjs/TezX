import { Context } from "../core/context.js";
import { CallbackReturn, Middleware } from "../types/index.js";
export type TimeoutOptions = {
    /**
     * ⏳ Function to dynamically determine the timeout duration (in milliseconds).
     */
    getTimeout: (ctx: Context) => number;
    /**
     * 🚫 Custom function to handle timeout errors.
     */
    onTimeout?: (ctx: Context, error: Error) => CallbackReturn;
    /**
     * 📝 Logging function for timeout events.
     */
    logTimeoutEvent?: (ctx: Context, error: Error) => void;
    /**
     * 🛠️ Custom function to clean up resources after a timeout.
     */
    cleanup?: (ctx: Context) => void;
};
/**
 * Middleware to enforce fully dynamic request timeouts.
 * @param options - Custom options for dynamic timeout handling.
 */
export declare const requestTimeout: (options: TimeoutOptions) => Middleware;
