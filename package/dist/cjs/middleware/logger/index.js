"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = logger;
exports.default = logger;
const colors_js_1 = require("../../utils/colors.js");
function logger() {
    return async function logger(ctx, next) {
        try {
            console.log(`${(0, colors_js_1.colorText)("<--", "bold")} ${(0, colors_js_1.colorText)(ctx.method, "bgMagenta")} ${ctx.pathname}`);
            const startTime = performance.now();
            let n = await next();
            const elapsed = performance.now() - startTime;
            console.log(`${(0, colors_js_1.colorText)("-->", "bold")} ${(0, colors_js_1.colorText)(ctx.method, "bgBlue")} ${ctx.pathname} ` +
                `${(0, colors_js_1.colorText)(ctx.getStatus, "yellow")} ${(0, colors_js_1.colorText)(`${elapsed.toFixed(2)}ms`, "magenta")}`);
            return n;
        }
        catch (err) {
            console.error(`${(0, colors_js_1.colorText)("Error:", "red")}`, err.stack);
            throw new Error(err.stack);
        }
    };
}
