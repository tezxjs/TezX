/**
 * Custom error type used throughout the Tezx application.
 *
 * Extends the built-in `Error` and carries an HTTP status code plus optional
 * structured `details` payload (useful for validation errors, metadata, etc.).
 *
 * @example
 * // Throw a 404
 * throw TezXError.notFound("User not found", { userId });
 *
 * @example
 * // Create and throw a custom status
 * throw new TezXError("Something went wrong", 502);
 *
 * @class TezXError
 * @extends Error
 */
export declare class TezXError extends Error {
    /**
     * HTTP status code representing the error (defaults to 500).
     */
    statusCode: number;
    /**
     * Optional additional details about the error (validation lists, meta, etc.).
     */
    details?: any;
    /**
     * Create an instance of TezXError.
     *
     * @param {string} message - Human readable error message.
     * @param {number} [statusCode=500] - HTTP status code to associate with this error.
     * @param {*} [details] - Optional additional error payload (e.g. validation errors).
     */
    constructor(message: string, statusCode?: number, details?: any);
    /**
     * Create a 400 Bad Request error.
     *
     * @param {string} [message="Bad Request"]
     * @param {*} [details]
     * @returns {TezXError}
     */
    static badRequest(message?: string, details?: any): TezXError;
    /**
     * Create a 401 Unauthorized error.
     *
     * @param {string} [message="Unauthorized"]
     * @param {*} [details]
     * @returns {TezXError}
     */
    static unauthorized(message?: string, details?: any): TezXError;
    /**
     * Create a 403 Forbidden error.
     *
     * @param {string} [message="Forbidden"]
     * @param {*} [details]
     * @returns {TezXError}
     */
    static forbidden(message?: string, details?: any): TezXError;
    /**
     * Create a 404 Not Found error.
     *
     * @param {string} [message="Resource Not Found"]
     * @param {*} [details]
     * @returns {TezXError}
     */
    static notFound(message?: string, details?: any): TezXError;
    /**
     * Create a 409 Conflict error.
     *
     * @param {string} [message="Conflict"]
     * @param {*} [details]
     * @returns {TezXError}
     */
    static conflict(message?: string, details?: any): TezXError;
    /**
     * Create a 500 Internal Server Error.
     *
     * @param {string} [message="Internal Server Error"]
     * @param {*} [details]
     * @returns {TezXError}
     */
    static internal(message?: string, details?: any): TezXError;
    /**
     * Convert the error into a JSON-serializable object that can be sent
     * in HTTP responses or logged safely.
     *
     * @returns {{ error: boolean, message: string, statusCode: number, details: any }}
     */
    toJSON(): {
        error: boolean;
        message: string;
        statusCode: number;
        details: any;
    };
}
export declare function TezXErrorParse(err: unknown, statusCode?: number): TezXError;
