/**
 * Generates a signed JSON Web Token (JWT).
 *
 * @function sign
 * @param {Record<string, any>} payload - The payload object containing user data or claims.
 * @param {Object} [options] - Optional signing options.
 * @param {string} [options.secret] - The secret key used to sign the token (default: process.env.JWT_SECRET or "tezx_secret").
 * @param {"HS256" | "HS512"} [options.algorithm="HS256"] - Hash algorithm to use (HMAC SHA-256 or SHA-512).
 * @param {string | number} [options.expiresIn="1d"] - Token expiration time (e.g., "2h", "7d", 3600).
 * @returns {string} The generated JWT as a string in the format `header.payload.signature`.
 *
 * @example
 * const token = sign({ userId: 1 }, { secret: "mySecret", algorithm: "HS512", expiresIn: "2h" });
 * console.log(token);
 */
export declare function sign(payload: Record<string, any>, options?: {
    secret?: string;
    algorithm?: "HS256" | "HS512";
    expiresIn?: string | number;
}): string;
/**
 * Verifies and decodes a JSON Web Token (JWT).
 *
 * @function verify
 * @param {string} token - The JWT string to verify.
 * @param {string} [secret] - The secret key used to verify the token (default: process.env.JWT_SECRET or "tezx_secret").
 * @returns {Record<string, any> | null} Decoded payload if valid; otherwise `null`.
 *
 * @example
 * const decoded = verify(token, "mySecret");
 * if (decoded) console.log("User ID:", decoded.userId);
 * else console.log("Invalid or expired token");
 */
export declare function verify(token: string, secret?: string): Record<string, any> | null;
declare const _default: {
    verify: typeof verify;
    sign: typeof sign;
};
export default _default;
