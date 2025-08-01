/**
 * A mapping of HTTP status codes to their standard reason phrases.
 *
 * This object maps common HTTP status codes to their
 * respective textual descriptions, useful for setting
 * or interpreting HTTP response status texts.
 *
 * @constant {Record<number, string>}
 *
 * @example
 * httpStatusMap[200]; // "OK"
 * httpStatusMap[404]; // "Not Found"
 * httpStatusMap[418]; // "I'm a Teapot"
 */
export declare const httpStatusMap: Record<number, string>;
