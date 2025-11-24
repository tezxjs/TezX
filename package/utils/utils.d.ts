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
 * Ultra-fast string slugifier.
 * Uses low-level string operations to reduce RegExp overhead.
 * Falls back to minimal replacements if environment lacks full RegExp support.
 *
 * @param {string} title - Input string to slugify
 * @returns {string} - Slugified, URL-safe string
 */
export declare function sanitized(title: string): string;
