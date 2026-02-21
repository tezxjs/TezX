import type { Callback, HTTPMethod, Middleware, RouteMatchResult, RouteRegistry } from "../types/index.js";
/**
 * Radix-based router implementation for efficient route matching.
 * Supports static, dynamic, optional, and wildcard parameters.
 */
export declare class RadixRouter implements RouteRegistry {
    private root;
    name: string;
    constructor();
    /**
     * Adds a new route to the radix tree.
     *
     * @param method - HTTP method (GET, POST, etc.)
     * @param path - Route path, e.g., "/users/:id?"
     * @param handlers - Array of handler functions or middleware
     * @throws Error if conflicting parameter definitions are detected
     */
    addRoute(method: HTTPMethod, path: string, handlers: (Callback | Middleware)[]): void;
    /**
     * Searches for a route match based on HTTP method and URL path.
     *
     * @param method - HTTP method to match
     * @param path - Request path
     * @returns RouteMatchResult containing handlers, middlewares, and parameters
     */
    search(method: HTTPMethod, path: string): RouteMatchResult;
    /**
     * Recursively matches the route path segments.
     *
     * @private
     */
    private _match;
    /**
     * Parses a route pattern into structured segments.
     *
     * @param pattern - The route string (e.g., "/users/:id?")
     * @returns Parsed segments containing type, value, paramName, and optionality
     */
    private parsePattern;
}
