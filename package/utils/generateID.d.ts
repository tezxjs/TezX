/**
 * Generate a fast, unique ID string using timestamp and random values.
 *
 * **Note:** This function is generally fast, but `generateUUID()` using
 * `crypto.randomUUID()` is even faster and more standardized in modern environments.
 *
 * Use `generateUUID()` if you want a UUID v4 string that is cryptographically secure
 * and ultra-fast (native implementation).
 *
 * Format: [timestamp in hex]-[random 12 hex chars]
 *
 * @returns {string} Unique ID string
 */
export declare function generateID(): string;
/**
 * Generate a cryptographically secure UUID (version 4).
 *
 * This uses the Web Crypto API's `crypto.randomUUID()` method to generate a
 * unique identifier. The UUID conforms to RFC4122 version 4 standard.
 *
 * @returns {string} A unique UUID string (e.g., "e7b2bfb2-86f5-4a6d-9e7f-b5121a2b8e7d").
 *
 * @runtime Supported in:
 * - ✅ Bun (native Web Crypto, extremely fast)
 * - ✅ Deno (native Web Crypto, fast)
 * - ✅ Node.js (v15+): via global `crypto.randomUUID()`
 *   ⚠️ In Node.js v14 or below, this will throw an error unless you polyfill `crypto`
 *
 * @example
 * const uuid = generateUUID();
 * console.log(uuid); // "a63e47b6-6a3b-4d53-90b6-8db2f2d07943"
 */
export declare function generateUUID(): string;
