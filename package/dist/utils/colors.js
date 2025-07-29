export const COLORS = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    underline: "\x1b[4m",
    gray: "\x1b[90m",
    white: "\x1b[97m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m",
    orange: "\x1b[38;2;255;88;30m",
    bgOrange: "\x1b[48;2;255;88;30m",
};
export function colorText(text, color) {
    return `${COLORS[color]}${text}${COLORS.reset}`;
}
