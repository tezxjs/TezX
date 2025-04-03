import { COLORS } from "../utils/colors";
export function logger() {
    return async (ctx, next) => {
        try {
            console.log(`${COLORS.bold}<-- ${COLORS.reset}${COLORS.bgMagenta} ${ctx.method} ${COLORS.reset} ${ctx.pathname}`);
            const startTime = performance.now();
            let n = await next();
            const elapsed = performance.now() - startTime;
            console.log(`${COLORS.bold}--> ${COLORS.reset}${COLORS.bgBlue} ${ctx.method} ${COLORS.reset} ${ctx.pathname} ` +
                `${COLORS.yellow}${ctx.getStatus}${COLORS.reset} ${COLORS.magenta}${elapsed.toFixed(2)}ms${COLORS.reset}`);
            return n;
        }
        catch (err) {
            console.error(`${COLORS.red}Error:${COLORS.reset}`, err.stack);
            throw new Error(err.stack);
        }
    };
}
