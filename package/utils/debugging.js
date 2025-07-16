import { COLORS } from "./colors.js";
export const loggerOutput = (level, message, ...args) => {
    const LEVEL_COLORS = {
        info: COLORS.blue,
        warn: COLORS.yellow,
        error: COLORS.red,
        debug: COLORS.cyan,
        success: COLORS.green,
    };
    const levelText = `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${COLORS.reset}`;
    console.log(` ${levelText} ${message}`, ...args?.flat());
};
