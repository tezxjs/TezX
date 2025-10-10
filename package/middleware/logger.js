import { TezXError } from "../core/error.js";
import { colorText } from "../utils/colors.js";
function logger(options = { enabled: true }) {
    return async function logger(ctx, next) {
        try {
            if (!options?.enabled) {
                return next();
            }
            console.log(`${colorText("<--", "bold")} ${colorText(ctx.method, "bgMagenta")} ${ctx.pathname}`);
            const startTime = performance.now();
            let n = (await next());
            const elapsed = performance.now() - startTime;
            console.log(`${colorText("-->", "bold")} ${colorText(ctx.method, "bgBlue")} ${ctx.pathname} ` +
                `${colorText(n ? ctx.getStatus : 404, "yellow")} ${colorText(`${elapsed.toFixed(2)}ms`, "magenta")}`);
            return n;
        }
        catch (err) {
            console.error(`${colorText("Error:", "red")}`, err.stack);
            throw new TezXError(err.stack);
        }
    };
}
export { logger as default, logger };
