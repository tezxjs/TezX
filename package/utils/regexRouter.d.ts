/**
 * Compiles a route string or segment array into a regular expression for matching URL paths.
 * Supports dynamic `:param`, optional `:param?`, and wildcard `*param` segments.
 *
 * @param {string | string[]} seg - The route pattern, either as a string (`'/user/:id'`)
 *   or an array of segments (`['user', ':id']`).
 *
 * @returns {{
*   regex: RegExp,
*   paramNames: string[]
* }}
* @example
* const { regex, paramNames } = compileRegexRoute('/user/:id/post/:slug?');
* // regex: /^\/user\/([^\/]+)\/(?:([^\/]+))?\/?$/
* // paramNames: ['id', 'slug']
*
* regex.test('/user/123/post/hello'); // ✅ true
* regex.test('/user/123/post');       // ✅ true (because :slug? is optional)
*
* @example
* const { regex, paramNames } = compileRegexRoute('/files/*path');
* // regex: /^\/files\/(.+)\/?$/
* // paramNames: ['path']
*
* regex.test('/files/images/cat.jpg'); // ✅ true
*/
export declare function compileRegexRoute(seg: string | string[]): {
    regex: RegExp;
    paramNames: string[];
};
/**
 * Combines a base path with a route regex pattern.
 *
 * @param basePath - The base path to prepend (e.g., '/api/v1')
 * @param routeRegex - The original route regex (e.g., /^\/users\/([^/]+?)$/)
 * @returns A new regex that includes the base path
 */
export declare function addBaseToRegex(basePath: string, routeRegex: RegExp): RegExp;
/**
 * Matches a given URL against a provided regular expression and extracts named parameters.
 *
 * @param {RegExp} regex - The regular expression to match against the URL.
 *   It should include capturing groups for each parameter.
 *   Example: /^\/user\/(\d+)\/post\/(\w+)$/
 *
 * @param {string} url - The URL string to match.
 *   Example: "/user/123/post/abc"
 *
 * @param {string[]} paramNames - An array of parameter names corresponding to the capturing groups in the regex.
 *   Example: ["userId", "postId"]
 *
 * @returns {{ success: boolean, params: Record<string, string | null> }} An object indicating:
 *   - `success`: whether the URL matched the regex.
 *   - `params`: an object mapping parameter names to their matched values, or `null` if not found.
 *
 * @example
 * const regex = /^\/user\/(\d+)\/post\/(\w+)$/;
 * const url = "/user/123/post/abc";
 * const paramNames = ["userId", "postId"];
 * const result = regexMatchRoute(regex, url, paramNames);
 * // result = { success: true, params: { userId: "123", postId: "abc" } }
 */
export declare function regexMatchRoute(regex: RegExp, url: string, paramNames?: string[]): {
    params: Record<string, string | null>;
    success: boolean;
};
