declare class HeadersParser {
    private headers;
    constructor(init?: [string, string][] | Record<string, string>);
    /**
     * Adds multiple headers to the parser.
     * @param headers - Headers as an array of tuples or a record object.
     */
    add(headers: [string, string][] | Record<string, string>): this;
    /**
     * Sets a header value.
     * @param key - Header name.
     * @param value - Header value(s).
     */
    set(key: string, value: string | string[]): this;
    /**
     * Retrieves the first value of a header.
     * @param key - Header name.
     * @returns The first header value or undefined if not found.
     */
    get(key: string): string | undefined;
    /**
     * Retrieves all values of a header.
     * @param key - Header name.
     * @returns An array of header values.
     */
    getAll(key: string): string[];
    /**
     * Checks if a header exists.
     * @param key - Header name.
     * @returns True if the header exists, false otherwise.
     */
    has(key: string): boolean;
    /**
     * Deletes a header.
     * @param key - Header name.
     * @returns True if deleted successfully, false otherwise.
     */
    delete(key: string): boolean;
    /**
     * Appends a value to an existing header or creates a new one.
     * @param key - Header name.
     * @param value - Value to append.
     */
    append(key: string, value: string): this;
    /**
     * Returns an iterator over header entries.
     * @returns IterableIterator of header key-value pairs.
     */
    entries(): IterableIterator<[string, string[]]>;
    /**
     * Returns an iterator over header keys.
     * @returns IterableIterator of header names.
     */
    keys(): IterableIterator<string>;
    /**
     * Returns an iterator over header values.
     * @returns IterableIterator of header values arrays.
     */
    values(): IterableIterator<string[]>;
    /**
     * Iterates over headers and executes a callback function.
     * @param callback - Function to execute for each header.
     */
    forEach(callback: (value: string[], key: string) => void): void;
    /**
     * Converts headers into a plain object.
     * @returns A record of headers where single-value headers are returned as a string.
     */
    toObject(): Record<string, string | string[]>;
}

type UrlRef = {
    hash: string | undefined;
    protocol: string | undefined;
    origin: string | undefined;
    username: string | undefined;
    password: string | undefined;
    hostname: string | undefined;
    port: string | undefined;
    href: string | undefined;
    query: {
        [key: string]: string;
    };
    pathname: string | undefined;
};

type FormDataOptions = {
    maxSize?: number;
    allowedTypes?: string[];
    sanitized?: boolean;
    maxFiles?: number;
};
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH" | "HEAD" | "ALL" | "TRACE" | "CONNECT" | string;
declare class Request$1 {
    #private;
    headers: HeadersParser;
    /**
     * Full request URL including protocol and query string
     * @type {string}
     */
    readonly url: string;
    /**
     * HTTP request method (GET, POST, PUT, DELETE, etc.)
     * @type {HTTPMethod}
     */
    readonly method: HTTPMethod;
    /** Parsed URL reference containing components like query parameters, pathname, etc. */
    readonly urlRef: UrlRef;
    /** Query parameters extracted from the URL */
    readonly query: Record<string, any>;
    /**
     * Retrieve a parameter by name.
     * @param name - The parameter name.
     * @returns The parameter value if found, or undefined.
     */
    readonly params: Record<string, any>;
    constructor(req: any, params: Record<string, any>);
    /**
     * Parses the request body as plain text.
     * @returns {Promise<string>} The text content of the request body.
     */
    text(): Promise<string>;
    /**
     * Parses the request body as JSON.
     * @returns {Promise<Record<string, any>>} The parsed JSON object.
     * If the Content-Type is not 'application/json', it returns an empty object.
     */
    json(): Promise<Record<string, any>>;
    /**
     * Parses the request body based on Content-Type.
     * Supports:
     * - application/json → JSON parsing
     * - application/x-www-form-urlencoded → URL-encoded form parsing
     * - multipart/form-data → Multipart form-data parsing (for file uploads)
     * @returns {Promise<Record<string, any>>} The parsed form data as an object.
     * @throws {Error} If the Content-Type is missing or invalid.
     */
    formData(options?: FormDataOptions): Promise<Record<string, any>>;
}

declare class TezResponse {
    /**
     * Sends a JSON response.
     * @param body - The response data.
     * @param status - (Optional) HTTP status code (default: 200).
     * @param headers - (Optional) Additional response headers.
     * @returns Response object with JSON data.
     */
    static json(body: any, status?: number, headers?: ResponseHeaders): Response;
    static json(body: any, headers?: ResponseHeaders): Response;
    static json(body: any, status?: number): Response;
    /**
     * Sends an HTML response.
     * @param data - The HTML content as a string.
     * @param status - (Optional) HTTP status code (default: 200).
     * @param headers - (Optional) Additional response headers.
     * @returns Response object with HTML data.
     */
    static html(data: string, status?: number, headers?: ResponseHeaders): Response;
    static html(data: string, headers?: ResponseHeaders): Response;
    static html(data: string, status?: number): Response;
    /**
     * Sends a plain text response.
     * @param data - The text content.
     * @param status - (Optional) HTTP status code (default: 200).
     * @param headers - (Optional) Additional response headers.
     * @returns Response object with plain text data.
     */
    static text(data: string, status?: number, headers?: ResponseHeaders): Response;
    static text(data: string, headers?: ResponseHeaders): Response;
    static text(data: string, status?: number): Response;
    /**
     * Sends an XML response.
     * @param data - The XML content.
     * @param status - (Optional) HTTP status code (default: 200).
     * @param headers - (Optional) Additional response headers.
     * @returns Response object with XML data.
     */
    static xml(data: string, status?: number, headers?: ResponseHeaders): Response;
    static xml(data: string, headers?: ResponseHeaders): Response;
    static xml(data: string, status?: number): Response;
    /**
     * Sends a response with any content type.
     * Automatically determines content type if not provided.
     * @param body - The response body.
     * @param status - (Optional) HTTP status code.
     * @param headers - (Optional) Additional response headers.
     * @returns Response object.
     */
    static send(body: any, status?: number, headers?: ResponseHeaders): Response;
    static send(body: any, headers?: ResponseHeaders): Response;
    static send(body: any, status?: number): Response;
    /**
     * Redirects to a given URL.
     * @param url - The target URL.
     * @param status - (Optional) HTTP status code (default: 302).
     * @param headers - (Optional) Additional headers.
     * @returns Response object with redirect.
     */
    static redirect(url: string, status?: number, headers?: ResponseHeaders): Response;
    /**
     * Handles file downloads.
     * @param filePath - The path to the file.
     * @param fileName - The name of the downloaded file.
     * @returns Response object for file download.
     */
    static download(filePath: string, fileName: string): Promise<Response>;
    /**
     * Serves a file to the client.
     * @param filePath - Absolute or relative path to the file.
     * @param fileName - (Optional) The name of the send file.
     * @param headers - (Optional) Additional headers.
     * @returns Response object with the file stream.
     */
    static sendFile(filePath: string, fileName?: string, headers?: ResponseHeaders): Promise<Response>;
    static sendFile(filePath: string, headers?: ResponseHeaders): Promise<Response>;
    static sendFile(filePath: string, fileName?: string): Promise<Response>;
}

/**
 * A simple key-value storage class using Map.
 */
declare class State {
    private state;
    constructor();
    /**
     * Store a value with a specific key.
     * @param key - The key for the value.
     * @param value - The value to be stored.
     */
    set(key: string, value: any): void;
    /**
     * Retrieve a value by key.
     * @param key - The key of the value to retrieve.
     * @returns The stored value or undefined if not found.
     */
    get(key: string): any | undefined;
    /**
     * Delete a key from storage.
     * @param key - The key to remove.
     * @returns True if the key was deleted, false otherwise.
     */
    delete(key: string): boolean;
    /**
     * Check if a key exists in the storage.
     * @param key - The key to check.
     * @returns True if the key exists, false otherwise.
     */
    has(key: string): boolean;
    /**
     * Get an array of all stored keys.
     * @returns An array of keys.
     */
    keys(): string[];
    /**
     * Get an array of all stored values.
     * @returns An array of values.
     */
    values(): any[];
    /**
     * Get an array of all key-value pairs.
     * @returns An array of [key, value] tuples.
     */
    entries(): [string, any][];
    /**
     * Remove all entries from storage.
     */
    clear(): void;
}

interface CookieOptions {
    expires?: Date;
    path?: string;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
}
type ResponseHeaders = Record<string, string>;
declare class Context<T extends Record<string, any> = {}> {
    #private;
    [key: string]: any;
    /**
     * Environment variables and configuration
     * @type {object}
     */
    env: Record<string, any> & T;
    /**
     * Parser for handling and manipulating HTTP headers
     * @type {HeadersParser}
     */
    headers: HeadersParser;
    /**
     * Request path without query parameters
     * @type {string}
     */
    readonly pathname: string;
    /**
     * Full request URL including protocol and query string
     * @type {string}
     */
    readonly url: string;
    /**
     * HTTP request method (GET, POST, PUT, DELETE, etc.)
     * @type {HTTPMethod}
     */
    readonly method: HTTPMethod;
    /**
     * Public state container for application data
     * state storage for middleware and plugins
     * @type {State}
     */
    state: State;
    /**
     * Flag indicating if the request processing is complete
     * @type {boolean}
     */
    finalized: boolean;
    constructor(req: any);
    /**
     * Cookie handling utility with get/set/delete operations
     * @returns {{
     *  get: (name: string) => string | undefined,
     *  all: () => Record<string, string>,
     *  delete: (name: string, options?: CookieOptions) => void,
     *  set: (name: string, value: string, options?: CookieOptions) => void
     * }} Cookie handling interface
     */
    /**
    * Sets a header value.
    * @param key - Header name.
    * @param value - Header value(s).
    */
    header(key: string, value: string | string[]): this;
    get cookies(): {
        /**
         * Get a specific cookie by name.
         * @param {string} cookie - The name of the cookie to retrieve.
         * @returns {string | undefined} - The cookie value or undefined if not found.
         */
        get: (cookie: string) => string;
        /**
         * Get all cookies as an object.
         * @returns {Record<string, string>} - An object containing all cookies.
         */
        all: () => Record<string, string>;
        /**
         * Delete a cookie by setting its expiration to the past.
         * @param {string} name - The name of the cookie to delete.
         * @param {CookieOptions} [options] - Additional cookie options.
         */
        delete: (name: string, options?: CookieOptions) => void;
        /**
         * Set a new cookie with the given name, value, and options.
         * @param {string} name - The name of the cookie.
         * @param {string} value - The value of the cookie.
         * @param {CookieOptions} [options] - Additional options like expiration.
         */
        set: (name: string, value: string, options?: CookieOptions) => void;
    };
    /**
     * Sends a JSON response.
     * @param body - The response data.
     * @param status - (Optional) HTTP status code (default: 200).
     * @param headers - (Optional) Additional response headers.
     * @returns Response object with JSON data.
     */
    json(body: any, status?: number, headers?: ResponseHeaders): TezResponse;
    json(body: any, headers?: ResponseHeaders): TezResponse;
    json(body: any, status?: number): TezResponse;
    /**
     * Sends a response with any content type.
     * Automatically determines content type if not provided.
     * @param body - The response body.
     * @param status - (Optional) HTTP status code.
     * @param headers - (Optional) Additional response headers.
     * @returns Response object.
     */
    send(body: any, status?: number, headers?: ResponseHeaders): any;
    send(body: any, headers?: ResponseHeaders): any;
    send(body: any, status?: number): any;
    /**
     * Sends an HTML response.
     * @param data - The HTML content as a string.
     * @param status - (Optional) HTTP status code (default: 200).
     * @param headers - (Optional) Additional response headers.
     * @returns Response object with HTML data.
     */
    html(data: string, status?: number, headers?: ResponseHeaders): any;
    html(data: string, headers?: ResponseHeaders): any;
    html(data: string, status?: number): any;
    /**
     * Sends a plain text response.
     * @param data - The text content.
     * @param status - (Optional) HTTP status code (default: 200).
     * @param headers - (Optional) Additional response headers.
     * @returns Response object with plain text data.
     */
    text(data: string, status?: number, headers?: ResponseHeaders): any;
    text(data: string, headers?: ResponseHeaders): any;
    text(data: string, status?: number): any;
    /**
     * Sends an XML response.
     * @param data - The XML content.
     * @param status - (Optional) HTTP status code (default: 200).
     * @param headers - (Optional) Additional response headers.
     * @returns Response object with XML data.
     */
    xml(data: string, status?: number, headers?: ResponseHeaders): any;
    xml(data: string, headers?: ResponseHeaders): any;
    xml(data: string, status?: number): any;
    /**
     * HTTP status code..
     * @param status - number.
     * @returns Response object with context all method.
     */
    status: (status: number) => this;
    /**
     * Redirects to a given URL.
     * @param url - The target URL.
     * @param status - (Optional) HTTP status code (default: 302).
     * @param headers - (Optional) Additional headers.
     * @returns Response object with redirect.
     */
    redirect(url: string, status?: number, headers?: ResponseHeaders): Response;
    /**
     * Handles file downloads.
     * @param filePath - The path to the file.
     * @param fileName - The name of the downloaded file.
     * @returns Response object for file download.
     */
    download(filePath: string, fileName: string): Promise<Response>;
    /**
     * Serves a file to the client.
     * @param filePath - Absolute or relative path to the file.
     * @param fileName - (Optional) The name of the send file.
     * @param headers - (Optional) Additional headers.
     * @returns Response object with the file stream.
     */
    sendFile(filePath: string, fileName?: string, headers?: ResponseHeaders): Promise<Response>;
    sendFile(filePath: string, headers?: ResponseHeaders): Promise<Response>;
    sendFile(filePath: string, fileName?: string): Promise<Response>;
    /**
     * Getter that creates a standardized Request object from internal state
     * @returns {Request} - Normalized request object combining:
     * - Raw platform-specific request
     * - Parsed headers
     * - Route parameters
     *
     * @example
     * // Get standardized request
     * const request = ctx.req;
     * // Access route params
     * const id = request.params.get('id');
     */
    get req(): Request$1;
    protected set params(params: Record<string, any>);
    protected get params(): Record<string, any>;
}

declare class CommonHandler {
    /**
     * Register a custom 404 handler for missing routes
     * @param {Callback} callback - Handler function to execute when no route matches
     * @returns {this} - Returns current instance for chaining
     *
     * @example
     * // Register a custom not-found handler
     * app.notFound((ctx) => {
     *   ctx.status(404).text('Custom not found message');
     * });
     */
    notFound(callback: Callback): this;
    onError(callback: <T extends Record<string, any> = {}>(err: string, ctx: ctx<T>) => any): this;
}

type DuplicateMiddlewares = Middleware<any>[];
type UniqueMiddlewares = Set<Middleware<any>>;
declare class TriMiddleware {
    children: Map<string, TriMiddleware>;
    middlewares: DuplicateMiddlewares | UniqueMiddlewares;
    isOptional: boolean;
    pathname: string;
    constructor(pathname?: string);
}
declare class MiddlewareConfigure<T extends Record<string, any> = {}> extends CommonHandler {
    triMiddlewares: TriMiddleware;
    protected basePath: string;
    constructor(basePath?: string);
    protected addMiddleware(pathname: string, middlewares: Middleware<T>[]): void;
}

type NextCallback = () => Promise<any>;
type ctx<T extends Record<string, any> = {}> = Context<T> & T;
type Callback<T extends Record<string, any> = {}> = (ctx: ctx<T>) => Promise<TezResponse> | TezResponse;
type Middleware<T extends Record<string, any> = {}> = (ctx: ctx<T>, next: NextCallback) => NextCallback | Promise<TezResponse> | TezResponse;
type RouterConfig = {
    /**
     * `env` allows you to define environment variables for the router.
     * It is a record of key-value pairs where the key is the variable name
     * and the value can be either a string or a number.
     */
    env?: Record<string, string | number>;
    /**
     * `basePath` sets the base path for the router. This is useful for grouping
     * routes under a specific path prefix.
     */
    basePath?: string;
};
declare class TrieRouter {
    children: Map<string, TrieRouter>;
    handlers: Map<HTTPMethod, {
        callback: Callback<any>;
        middlewares: UniqueMiddlewares | DuplicateMiddlewares;
    }>;
    pathname: string;
    paramName: any;
    isParam: boolean;
    constructor(pathname?: string);
}
type StaticServeOption = {
    cacheControl?: string;
    headers?: ResponseHeaders;
};
declare class Router<T extends Record<string, any> = {}> extends MiddlewareConfigure<T> {
    #private;
    protected routers: Map<string, Map<HTTPMethod, {
        callback: Callback<T>;
        middlewares: UniqueMiddlewares | DuplicateMiddlewares;
    }>>;
    protected env: Record<string, string | number>;
    protected triRouter: TrieRouter;
    constructor({ basePath, env }?: RouterConfig);
    /**
     * Serves static files from a specified directory.
     *
     * This method provides two overloads:
     * 1. `static(route: string, folder: string, option?: StaticServeOption): this;`
     *    - Serves static files from `folder` at the specified `route`.
     * 2. `static(folder: string, option?: StaticServeOption): this;`
     *    - Serves static files from `folder` at the root (`/`).
     *
     * @param {string} route - The base route to serve static files from (optional in overload).
     * @param {string} folder - The folder containing the static files.
     * @param {StaticServeOption} [option] - Optional settings for static file serving.
     * @returns {this} Returns the current instance to allow method chaining.
     */
    static(route: string, folder: string, option?: StaticServeOption): this;
    static(folder: string, Option?: StaticServeOption): this;
    /**
     * Registers a GET route with optional middleware(s)
     * @param path - URL path pattern (supports route parameters)
     * @param args - Handler callback or middleware(s) + handler
     * @returns Current instance for chaining
     *
     * @example
     * // Simple GET route
     * app.get('/users', (ctx) => { ... });
     *
     * // With middleware
     * app.get('/secure', authMiddleware, (ctx) => { ... });
     *
     * // With multiple middlewares
     * app.get('/admin', [authMiddleware, adminMiddleware], (ctx) => { ... });
     */
    get(path: string, callback: Callback<T>): this;
    get(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    get(path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Registers a POST route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    post(path: string, callback: Callback<T>): this;
    post(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    post(path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Registers a PUT route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    put(path: string, callback: Callback<T>): this;
    put(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    put(path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Registers a PATCH route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    patch(path: string, callback: Callback<T>): this;
    patch(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    patch(path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Registers a DELETE route with optional middleware(s)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    delete(path: string, callback: Callback<T>): this;
    delete(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    delete(path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Registers an OPTIONS route (primarily for CORS preflight requests)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    options(path: string, callback: Callback<T>): this;
    options(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    options(path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Registers a HEAD route (returns headers only)
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    head(path: string, callback: Callback<T>): this;
    head(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    head(path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Registers a route that responds to all HTTP methods
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     */
    all(path: string, callback: Callback<T>): this;
    all(path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    all(path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Generic method registration for custom HTTP methods
     * @param method - HTTP method name (e.g., 'PURGE')
     * @param path - URL path pattern
     * @param args - Handler callback or middleware(s) + handler
     *
     * @example
     * // Register custom method
     * server.addRoute('PURGE', '/cache', purgeHandler);
     */
    addRoute(method: HTTPMethod, path: string, callback: Callback<T>): this;
    addRoute(method: HTTPMethod, path: string, middlewares: Middleware<T>[], callback: Callback<T>): this;
    addRoute(method: HTTPMethod, path: string, middlewares: Middleware<T>, callback: Callback<T>): this;
    /**
     * Mount a sub-router at specific path prefix
     * @param path - Base path for the sub-router
     * @param router - Router instance to mount
     * @returns Current instance for chaining
     *
     * @example
     * const apiRouter = new Router();
     * apiRouter.get('/users', () => { ... });
     * server.addRouter('/api', apiRouter);
     */
    addRouter(path: string, router: Router<T | any>): void;
    /**
     * Create route group with shared path prefix
     * @param prefix - Path prefix for the group
     * @param callback - Function that receives group-specific router
     * @returns Current router instance for chaining
     *
     * @example
     * app.group('/v1', (group) => {
     *   group.get('/users', v1UserHandler);
     * });
     */
    group(prefix: string, callback: (group: Router<T>) => void): this;
    /**
     * Register middleware with flexible signature
     * @overload
     * @param path - Optional path to scope middleware
     * @param middlewares - Middleware(s) to register
     * @param [callback] - Optional sub-router or handler
     */
    use(path: string, middlewares: Middleware<T>[], callback: Callback<T> | Router<T | any>): this;
    use(path: string, middleware: Middleware<T>, callback: Callback<T> | Router<T | any>): this;
    use(path: string, middlewares: Middleware<T>[]): this;
    use(path: string, middleware: Middleware<T>): this;
    use(path: string, callback: Callback<T> | Router<T | any>): this;
    use(middlewares: Middleware<T>[], callback: Callback<T> | Router<T | any>): this;
    use(middleware: Middleware<T>, callback: Callback<T> | Router<T | any>): this;
    use(middlewares: Middleware<T>[]): this;
    use(middleware: Middleware<T>): this;
    use(callback: Callback<T> | Router<T | any>): this;
}

interface ServeResponse {
    status: number;
    headers: {
        [key: string]: string;
    };
    body: string;
    statusText: string;
}
type LoggerFnType = () => {
    request?: (method: HTTPMethod, pathname: string) => void;
    response?: (method: HTTPMethod, pathname: string, status?: number) => void;
    info?: (msg: string, ...args: unknown[]) => void;
    warn?: (msg: string, ...args: unknown[]) => void;
    error?: (msg: string, ...args: unknown[]) => void;
    debug?: (msg: string, ...args: unknown[]) => void;
    success?: (msg: string, ...args: unknown[]) => void;
};
type TezXConfig = {
    /**
     * `allowDuplicateMw` determines whether duplicate middleware functions
     * are allowed in the router.
     *
     * - When `true`: The same middleware can be added multiple times.
     * - When `false`: Ensures each middleware is registered only once
     *   per route or application context.
     *
     * @default false
     */
    allowDuplicateMw?: boolean;
    /**
     * `overwriteMethod` controls whether existing route handlers
     * should be overwritten when a new handler for the same
     * HTTP method and path is added.
     *
     * - When `true`: The new handler replaces the existing one.
     * - When `false`: Prevents overwriting, ensuring that the
     *   first registered handler remains active.
     *
     * @default true
     */
    overwriteMethod?: boolean;
    /**
     * `logger` is an optional function that handles logging within the application.
     * It should conform to the `LoggerFnType`, which defines the expected signature for the logging function.
     *
     * If provided, this function will be called for logging purposes throughout the application.
     */
    logger?: LoggerFnType;
} & RouterConfig;
declare class TezX<T extends Record<string, any> = {}> extends Router<T> {
    #private;
    constructor({ basePath, env, logger, allowDuplicateMw, overwriteMethod, }?: TezXConfig);
    protected findRoute(method: HTTPMethod, pathname: string): {
        callback: any;
        middlewares: Middleware<T>[];
        params: Record<string, string>;
    } | null;
    serve(req: Request): Promise<ServeResponse | any>;
}

declare function denoAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>): {
    listen: (port: number, callback?: (message: string) => void) => any;
};
declare function bunAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>): {
    listen: (port: number, callback?: (message: string) => void) => any;
};
declare function nodeAdapter<T extends Record<string, any> = {}>(TezX: TezX<T>): {
    listen: (port: number, callback?: (message: string) => void) => void;
};

declare function useParams({ path, urlPattern, }: {
    path: string;
    urlPattern: string;
}): {
    success: boolean;
    params: Record<string, any>;
};

/**
 * Loads environment variables from .env files.
 * @param basePath - The base directory where .env files are located.
 */
declare function loadEnv(basePath?: string): Record<string, string>;

type LogLevel = "info" | "warn" | "error" | "debug" | "success";
/**
 * A universal logger function that measures and logs the processing time of an operation.
 * @param label - A label to identify the operation being logged.
 * @param callback - The operation to measure and execute.
 */
declare function logger(): {
    request: (method: HTTPMethod, pathname: string) => void;
    response: (method: HTTPMethod, pathname: string, status?: number) => void;
    info: (msg: string, ...args: unknown[]) => void;
    warn: (msg: string, ...args: unknown[]) => void;
    error: (msg: string, ...args: unknown[]) => void;
    debug: (msg: string, ...args: unknown[]) => void;
    success: (msg: string, ...args: unknown[]) => void;
};

type CorsOptions = {
    origin?: string | RegExp | (string | RegExp)[] | ((reqOrigin: string) => boolean);
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
};
declare function cors(option?: CorsOptions): (ctx: ctx, next: () => Promise<any>) => Promise<any>;

export { type Callback, type ctx as Context, type CorsOptions, type LogLevel, type LoggerFnType, type Middleware, type NextCallback, Router, type RouterConfig, type StaticServeOption, TezResponse, TezX, type TezXConfig, type UrlRef, bunAdapter, cors, denoAdapter, loadEnv, logger, nodeAdapter, useParams };
