import { GlobalConfig } from "../../core/config.js";
import { Context, Middleware } from "../../index.js";

// Type definition for the lazy module loader function. This function returns a promise that resolves to the module.
export type LazyModuleLoader<T> = () => Promise<T>;

// Interface for the cache item. It stores the loaded module, the timestamp when it was cached, and the expiration time.
export interface CacheItem<T = any> {
    module: T;
    expiresAt: number; // Expiration time of the cache item
}

// Interface for the lazy load options, which include configuration options like caching, lifecycle hooks, etc.
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
    getModuleLoader: (
        ctx: Context,
    ) => Promise<LazyModuleLoader<T> | null> | null | LazyModuleLoader<T>;

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

const lazyLoader = <T = any>(
    options: LazyLoadOptions<T>,
): Middleware => {
    const {
        moduleKey = (ctx) =>
            ctx.req.params[queryKeyModule] || ctx.req.query[queryKeyModule],
        getModuleLoader,
        queryKeyModule = "module",
        moduleContextKey = "module",
        cacheTTL = 3600000,
        enableCache = true,
        cacheStorage,
        lifecycleHooks = {},
        validateModule,
    } = options;

    let storage = cacheStorage;
    if (enableCache && !cacheStorage) {
        storage = new Map<string, CacheItem<T>>();
    }
    return async function lazyLoader(ctx, next) {
        // Determine which module to load
        let moduleName =
            moduleKey(ctx) ||
            ctx.req.params[queryKeyModule] ||
            ctx.req.query[queryKeyModule]; // fallback to path params

        if (!moduleName) {
            GlobalConfig.debugging.warn("No module specified for lazy loading.");
            return await next();
        }

        try {
            // Check if the module is already cached
            if (enableCache) {
                const cached = storage!.get(moduleName);
                if (cached) {
                    if (cached.expiresAt < Date.now()) {
                        storage!.delete(moduleName); // Expired cache, reload
                    } else {
                        GlobalConfig.debugging.info(`Using cached module: ${moduleName}`);
                        ctx[moduleContextKey] = cached?.module;
                        lifecycleHooks.onCacheHit?.(moduleName, ctx[moduleContextKey], ctx);
                        lifecycleHooks.onComplete?.(moduleName, ctx[moduleContextKey], ctx);
                        return await next();
                    }
                }
            }

            // Get the module loader function
            // Get loader and load module
            if (!getModuleLoader) {
                throw new Error(`No module loader found for module: ${moduleName}`);
            }
            const moduleLoader = await getModuleLoader(ctx);

            if (!moduleLoader) {
                throw new Error(`No loader found for module: ${moduleName}`);
            }

            // Trigger onLoad hook
            lifecycleHooks.onLoad?.(moduleName, ctx);

            // Dynamically load the module
            const module: any = await moduleLoader();

            if (validateModule && !validateModule(module)) {
                throw new Error(`Module validation failed for: ${moduleName}`);
            }

            // Inject dependencies if required
            // Cache the module if caching is enabled
            if (enableCache) {
                storage!.set(moduleName, {
                    module,
                    expiresAt: Date.now() + cacheTTL,
                });
                lifecycleHooks.onCacheSet?.(moduleName, module, ctx);
            }

            // Attach the loaded module to the context
            ctx[moduleContextKey] = module;

            if (module.init && typeof module.init === "function") {
                const initResult = await module.init(ctx);
                // Handle different return patterns
                if (initResult) {
                    return initResult;
                }
            }

            // Trigger onComplete hook
            lifecycleHooks.onComplete?.(moduleName, module, ctx);
            GlobalConfig.debugging.success(
                `Successfully loaded module: ${moduleName}`,
            );
        } catch (error: any) {
            GlobalConfig.debugging.error(
                `Error loading module: ${moduleName}`,
                error,
            );
            // Trigger onError hook
            lifecycleHooks.onError?.(moduleName, error, ctx);

            ctx.setStatus = 500;
            throw error;
        }

        // Proceed to the next middleware
        return await next();
    };
};


export {
    lazyLoader, lazyLoader as default,
}