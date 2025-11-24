/**
 * Generates a unique ID string using timestamp and random bytes.
 *
 * Format: `{timestampInHex}-{12HexRandom}`
 * Example: `174f3b2e6f8-4a3b9c1d7e2f`
 *
 * @returns {string} A unique ID string.
 */
export declare function generateID(): string;
/**
 * Generates a UUID (version 4) string.
 *
 * Uses Bun's built-in `crypto.randomUUID()`.
 *
 * @returns {string} A UUID string, e.g., "3b241101-e2bb-4255-8caf-4136c566a962".
 */
export declare function generateUUID(): string;
/**
 * Generates a random Base64 string using `Math.random`.
 *
 * Note: This is **not cryptographically secure**.
 * Use for non-security-critical purposes like temporary IDs or random labels.
 *
 * @param {number} [length=16] - The length of the resulting Base64 string.
 * @returns {string} A random Base64 string of the specified length.
 *
 * @example
 * const randomStr = generateRandomBase64(8);
 * console.log(randomStr); // e.g., "aZ3B9XfG"
 */
export declare function generateRandomBase64(length?: number): string;
