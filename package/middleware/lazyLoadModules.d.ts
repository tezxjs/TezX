import { Context, Middleware } from "../index.js";
export type LazyModuleLoader<T> = () => Promise<T>;
export interface CacheItem<T = any> {
    module: T;
    expiresAt: number;
}
export interface LazyLoadOptions<T> {
    /**
     * 🗺️ Key to identify the module to load. This can be a function that extracts the module name from the request context.
     * @default (ctx) => ctx.req.params[queryKeyModule] || ctx.req.query[queryKeyModule]
     */
    moduleKey?: (ctx: Context) => string;
    /**
     * 🛠️ Function that returns a loader function for the specified module, used to dynamically load the module.
     * If this function returns null, it indicates no loader is available for the module.
     */
    getModuleLoader: (ctx: Context) => Promise<LazyModuleLoader<T> | null> | null | LazyModuleLoader<T>;
    /**
     * 🔍 Query parameter name to select which module to load (e.g., "module").
     * @default "module"
     */
    queryKeyModule?: string;
    /**
     * 📦 Key to attach the loaded module to the context object.
     * @default "module"
     */
    moduleContextKey?: string;
    /**
     * 🔄 Enable caching of loaded modules to avoid re-loading them repeatedly.
     * @default true
     */
    enableCache?: boolean;
    /**
     * 🔄 Custom cache storage implementation (e.g., using `Map`, `Redis`, etc.).
     * By default, it uses a `Map<string, CacheItem<T>>`.
     */
    cacheStorage?: {
        get: (key: string) => CacheItem<T> | undefined;
        set: (key: string, value: CacheItem<T>) => void;
        delete: (key: string) => void;
    };
    /**
     * ⏳ Cache Time-To-Live (TTL) in milliseconds. This determines how long cached modules are valid.
     * @default 3600000 (1 hour)
     */
    cacheTTL?: number;
    /**
     * 🌟 Lifecycle hooks for the module loading process.
     * These hooks allow for custom actions at various stages of loading the module (e.g., when a module is loaded or when cache is hit).
     */
    lifecycleHooks?: {
        onLoad?: (moduleName: string, ctx: Context) => void;
        onError?: (moduleName: string, error: Error, ctx: Context) => void;
        onComplete?: (moduleName: string, module: T, ctx: Context) => void;
        onCacheHit?: (moduleName: string, module: T, ctx: Context) => void;
        onCacheSet?: (moduleName: string, module: T, ctx: Context) => void;
    };
    /**
     * 🛡️ Module validation function to ensure the module meets specific criteria before use.
     * This function will be called after the module is loaded to verify its structure or behavior.
     * If validation fails, an error is thrown.
     */
    validateModule?: (module: T) => boolean;
}
/**
 * Middleware for handling lazy loading of modules. This middleware allows dynamically loading modules based on route or query parameters.
 * It supports caching, lifecycle hooks, and module validation.
 *
 * @param options - Custom options for lazy loading, including caching, hooks, and module validation.
 * @returns A middleware function to use in your application.
 */
export declare const lazyLoadModules: <T = any>(options: LazyLoadOptions<T>) => Middleware;
