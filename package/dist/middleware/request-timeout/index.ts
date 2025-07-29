import { GlobalConfig } from "../../core/config.js";
import { Context } from "../../core/context.js";
import { HttpBaseResponse, Middleware } from "../../types/index.js";

export type TimeoutOptions = {
    /**
     * ⏳ Function to dynamically determine the timeout duration (in milliseconds).
     */
    getTimeout: (ctx: Context) => number;

    /**
     * 🚫 Custom function to handle timeout errors.
     */
    onTimeout?: (ctx: Context, error: Error) => HttpBaseResponse;

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
const requestTimeout = (options: TimeoutOptions): Middleware => {
    const {
        getTimeout,
        onTimeout = (ctx) => {
            ctx.setStatus = 504; // Gateway Timeout
            ctx.body = { error: "Request timed out." };
        },
        logTimeoutEvent = (ctx, error) => {
            GlobalConfig.debugging.warn(
                `[TIMEOUT] ${error.message}: ${ctx.method} ${ctx.path}`,
            );
        },
        cleanup = () => {
            // Default cleanup logic (can be overridden)
        },
    } = options;
    return async function requestTimeout(ctx, next) {
        let timeoutId: NodeJS.Timeout | null = null;

        try {
            // Dynamically determine the timeout duration
            const timeout = getTimeout(ctx);

            const timeoutPromise = new Promise<void>((_, reject) => {
                timeoutId = setTimeout(() => {
                    const timeoutError = new Error("Request timed out.");
                    logTimeoutEvent(ctx, timeoutError);
                    reject(timeoutError);
                }, timeout);
            });

            // Race between the request processing and the timeout
            return await Promise.race([next(), timeoutPromise]);
        } catch (error) {
            if ((error as Error).message === "Request timed out.") {
                onTimeout(ctx, error as Error);
            } else {
                throw error; // Re-throw other errors
            }
        } finally {
            // Cleanup resources
            if (timeoutId) {
                clearTimeout(timeoutId); // Clear the timeout to prevent memory leaks
            }
            cleanup(ctx);
        }
    };
};

export {
    requestTimeout, requestTimeout as default,
}