"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logger;
exports.logger = logger;
const colors_js_1 = require("../utils/colors.js");
function logger(options = { enabled: true }) {
    return async function logger(ctx, next) {
        try {
            if (!options?.enabled) {
                return next();
            }
            console.log(`${(0, colors_js_1.colorText)("<--", "bold")} ${(0, colors_js_1.colorText)(ctx.method, "bgMagenta")} ${ctx.pathname}`);
            const startTime = performance.now();
            let n = (await next());
            const elapsed = performance.now() - startTime;
            console.log(`${(0, colors_js_1.colorText)("-->", "bold")} ${(0, colors_js_1.colorText)(ctx.method, "bgBlue")} ${ctx.pathname} ` +
                `${(0, colors_js_1.colorText)(ctx.res?.status ?? 404, "yellow")} ${(0, colors_js_1.colorText)(`${elapsed.toFixed(2)}ms`, "magenta")}`);
            return n;
        }
        catch (err) {
            console.error(`${(0, colors_js_1.colorText)("Error:", "red")}`, err.stack);
            let error = err instanceof Error ? err : new Error(err);
            throw error;
        }
    };
}
