/**
 * Normalizes an HTTP header key to "Title-Case" format.
 * For example, `"content-type"` becomes `"Content-Type"`.
 *
 * @param {string} key - The HTTP header key to normalize.
 * @returns {string} The normalized header key in Title-Case format.
 *
 * @example
 * normalizeHeaderKey("content-type"); // → "Content-Type"
 * normalizeHeaderKey("x-custom-header"); // → "X-Custom-Header"
 */
export declare function normalizeHeaderKey(key: string): string;
/**
 * Extracts the file extension from a given file path or filename.
 * The returned extension is always lowercase.
 *
 * @param {string} filePath - The full file path or filename.
 * @returns {string} The file extension without the dot, or an empty string if none found.
 *
 * @example
 * extensionExtract("image.PNG"); // → "png"
 * extensionExtract("/path/to/archive.tar.gz"); // → "gz"
 * extensionExtract("filename"); // → ""
 */
export declare function extensionExtract(filePath: string): string;
/**
 * Combines a base path and a relative path, then splits the combined path into segments,
 * filtering out any `".."` segments to sanitize the path.
 *
 * @param {string} basePath - The base path (e.g., "/api").
 * @param {string} path - The relative or additional path to combine (e.g., "users/123").
 * @param {string[]} [out] - Optional array to append the segments to.
 * @returns {string[]} Array of sanitized path segments (without `".."`).
 *
 * @example
 * sanitizePathSplitBasePath("/api", "users/../admin"); // returns ["api", "admin"]
 */
export declare function sanitizePathSplitBasePath(basePath: string, path: string, out?: string[]): string[];
/**
 * Splits a path string into segments, ignoring `".."` segments to sanitize the path.
 *
 * @param {string} path - The path string to split (e.g., "/api/users/../admin").
 * @param {string[]} [out] - Optional array to append the segments to.
 * @returns {string[]} Array of sanitized path segments (without `".."`).
 *
 * @example
 * sanitizePathSplit("/api/users/../admin"); // returns ["api", "users", "admin"]
 */
export declare function sanitizePathSplit(path: string, out?: string[]): string[];
/**
 * Ultra-fast string slugifier.
 * Uses low-level string operations to reduce RegExp overhead.
 * Falls back to minimal replacements if environment lacks full RegExp support.
 *
 * @param {string} title - Input string to slugify
 * @returns {string} - Slugified, URL-safe string
 */
export declare function sanitized(title: string): string;
