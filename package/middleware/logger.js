import { colorText } from "../utils/colors.js";
function logger() {
    return async function logger(ctx, next) {
        try {
            console.log(`${colorText("<--", "bold")} ${colorText(ctx.method, "bgMagenta")} ${ctx.pathname}`);
            const startTime = performance.now();
            let n = await next();
            const elapsed = performance.now() - startTime;
            console.log(`${colorText("-->", "bold")} ${colorText(ctx.method, "bgBlue")} ${ctx.pathname} ` +
                `${colorText(ctx.getStatus, "yellow")} ${colorText(`${elapsed.toFixed(2)}ms`, "magenta")}`);
            return n;
        }
        catch (err) {
            console.error(`${colorText("Error:", "red")}`, err.stack);
            throw new Error(err.stack);
        }
    };
}
export { logger, logger as default, };
