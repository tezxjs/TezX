"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = logger;
const colors_1 = require("../utils/colors");
function logger() {
    return async (ctx, next) => {
        try {
            console.log(`${colors_1.COLORS.bold}<-- ${colors_1.COLORS.reset}${colors_1.COLORS.bgMagenta} ${ctx.method} ${colors_1.COLORS.reset} ${ctx.pathname}`);
            const startTime = performance.now();
            let n = await next();
            const elapsed = performance.now() - startTime;
            console.log(`${colors_1.COLORS.bold}--> ${colors_1.COLORS.reset}${colors_1.COLORS.bgBlue} ${ctx.method} ${colors_1.COLORS.reset} ${ctx.pathname} ` +
                `${colors_1.COLORS.yellow}${ctx.getStatus}${colors_1.COLORS.reset} ${colors_1.COLORS.magenta}${elapsed.toFixed(2)}ms${colors_1.COLORS.reset}`);
            return n;
        }
        catch (err) {
            console.error(`${colors_1.COLORS.red}Error:${colors_1.COLORS.reset}`, err.stack);
            throw new Error(err.stack);
        }
    };
}
