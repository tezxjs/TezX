import { COLORS } from "./colors";
export const loggerOutput = (level, message, ...args) => {
    const timestamp = new Date().toISOString();
    const LEVEL_COLORS = {
        info: COLORS.blue,
        warn: COLORS.yellow,
        error: COLORS.red,
        debug: COLORS.cyan,
        success: COLORS.green,
    };
    const levelText = `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${COLORS.reset}`;
    console.log(` ${levelText} ${message}`, ...args?.flat());
    // console.log(`${prefix} ${levelText} ${message}`, (args?.[0] as any)?.[0])
    // console.log(`${prefix} ${levelText} ${message}`, ...args);
};
/**
 * A universal logger function that measures and logs the processing time of an operation.
 * @param label - A label to identify the operation being logged.
 * @param callback - The operation to measure and execute.
 */
