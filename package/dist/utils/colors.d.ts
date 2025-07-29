/**
 * ANSI escape codes for terminal text formatting and colors.
 *
 * These codes can be used to style console output with colors,
 * bold, underline, and background colors.
 *
 * @constant {Record<string, string>}
 *
 * @example
 * console.log(COLORS.red, "This text is red", COLORS.reset);
 */
export declare const COLORS: {
    reset: string;
    bold: string;
    underline: string;
    gray: string;
    white: string;
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    bgRed: string;
    bgGreen: string;
    bgYellow: string;
    bgBlue: string;
    bgMagenta: string;
    bgCyan: string;
    bgWhite: string;
    orange: string;
    bgOrange: string;
};
/**
 * Wraps the given text with ANSI color codes for terminal styling.
 *
 * @param {string | number} text - The text or number to be colored.
 * @param {keyof typeof COLORS} color - The color key from the COLORS object.
 * @returns {string} The input text wrapped with the specified ANSI color code and reset code.
 *
 * @example
 * console.log(colorText("Hello World", "red"));
 * // Output: (red colored "Hello World" in terminal)
 */
export declare function colorText(text: string | number, color: keyof typeof COLORS): string;
