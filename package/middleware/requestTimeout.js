import { GlobalConfig } from "../core/config.js";
export const requestTimeout = (options) => {
    const { getTimeout, onTimeout = (ctx) => {
        ctx.setStatus = 504;
        ctx.body = { error: "Request timed out." };
    }, logTimeoutEvent = (ctx, error) => {
        GlobalConfig.debugging.warn(`[TIMEOUT] ${error.message}: ${ctx.method} ${ctx.path}`);
    }, cleanup = () => {
    }, } = options;
    return async function requestTimeout(ctx, next) {
        let timeoutId = null;
        try {
            const timeout = getTimeout(ctx);
            const timeoutPromise = new Promise((_, reject) => {
                timeoutId = setTimeout(() => {
                    const timeoutError = new Error("Request timed out.");
                    logTimeoutEvent(ctx, timeoutError);
                    reject(timeoutError);
                }, timeout);
            });
            return await Promise.race([next(), timeoutPromise]);
        }
        catch (error) {
            if (error.message === "Request timed out.") {
                onTimeout(ctx, error);
            }
            else {
                throw error;
            }
        }
        finally {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            cleanup(ctx);
        }
    };
};
