/**
 * Check asynchronously if a file exists at the given path.
 * Supports Node.js, Bun, and Deno runtimes.
 *
 * @param {string} path - The file path to check.
 * @returns {Promise<boolean>} - Resolves to true if file exists, false otherwise.
 */
export declare function fileExists(path: string): Promise<boolean>;
/**
 * Asynchronously reads the entire file content as a Uint8Array.
 * Supports Node.js, Bun, and Deno runtimes.
 *
 * @param {string} path - Path to the file.
 * @returns {Promise<Uint8Array>} - Resolves to the file buffer.
 * @throws Will throw an error if the runtime is unsupported.
 */
export declare function getFileBuffer(path: string): Promise<Uint8Array>;
/**
 * Creates a readable stream for the given file path.
 * Supports Node.js, Bun, and Deno runtimes.
 *
 * @param {string} path - Path to the file.
 * @returns {Promise<ReadableStream>} - Resolves to a ReadableStream of the file content.
 * @throws Will throw an error if the runtime is unsupported.
 */
export declare function readStream(path: string): Promise<ReadableStream>;
/**
 * Asynchronously retrieves the size of a file in bytes.
 * Supports Node.js, Bun, and Deno runtimes.
 *
 * @param {string} path - Path to the file.
 * @returns {Promise<number>} - Resolves to the file size in bytes.
 */
export declare function fileSize(path: string): Promise<number>;
