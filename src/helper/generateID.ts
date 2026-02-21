/**
 * Generates a unique ID string using timestamp and random bytes.
 *
 * Format: `{timestampInHex}-{12HexRandom}`
 * Example: `174f3b2e6f8-4a3b9c1d7e2f`
 *
 * @returns {string} A unique ID string.
 */
export function generateID() {
  const timestamp = Date.now().toString(16);
  const randomHex = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, "0");
  return `${timestamp}-${randomHex}`;
}

/**
 * Generates a UUID (version 4) string.
 *
 * Uses Bun's built-in `crypto.randomUUID()`.
 *
 * @returns {string} A UUID string, e.g., "3b241101-e2bb-4255-8caf-4136c566a962".
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

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
export function generateRandomBase64(length = 16) {
  let result = "";
  const BASE64 =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (let i = 0; i < length; i++) {
    // pick a random index from BASE64
    const idx = Math.floor(Math.random() * 64);
    result += BASE64[idx];
  }
  return result;
}
