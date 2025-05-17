"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestTimeout = void 0;
const config_js_1 = require("../core/config.js");
const requestTimeout = (options) => {
    const { getTimeout, onTimeout = (ctx) => {
        ctx.setStatus = 504;
        ctx.body = { error: "Request timed out." };
    }, logTimeoutEvent = (ctx, error) => {
        config_js_1.GlobalConfig.debugging.warn(`[TIMEOUT] ${error.message}: ${ctx.method} ${ctx.path}`);
    }, cleanup = () => {
    }, } = options;
    return async (ctx, next) => {
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
exports.requestTimeout = requestTimeout;
