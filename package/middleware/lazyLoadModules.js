import { GlobalConfig } from "../core/config.js";
export const lazyLoadModules = (options) => {
    const { moduleKey = (ctx) => ctx.req.params[queryKeyModule] || ctx.req.query[queryKeyModule], getModuleLoader, queryKeyModule = "module", moduleContextKey = "module", cacheTTL = 3600000, enableCache = true, cacheStorage, lifecycleHooks = {}, validateModule, } = options;
    let storage = cacheStorage;
    if (enableCache && !cacheStorage) {
        storage = new Map();
    }
    return async function lazyLoadModules(ctx, next) {
        let moduleName = moduleKey(ctx) ||
            ctx.req.params[queryKeyModule] ||
            ctx.req.query[queryKeyModule];
        if (!moduleName) {
            GlobalConfig.debugging.warn("No module specified for lazy loading.");
            return await next();
        }
        try {
            if (enableCache) {
                const cached = storage.get(moduleName);
                if (cached) {
                    if (cached.expiresAt < Date.now()) {
                        storage.delete(moduleName);
                    }
                    else {
                        GlobalConfig.debugging.info(`Using cached module: ${moduleName}`);
                        ctx[moduleContextKey] = cached?.module;
                        lifecycleHooks.onCacheHit?.(moduleName, ctx[moduleContextKey], ctx);
                        lifecycleHooks.onComplete?.(moduleName, ctx[moduleContextKey], ctx);
                        return await next();
                    }
                }
            }
            if (!getModuleLoader) {
                throw new Error(`No module loader found for module: ${moduleName}`);
            }
            const moduleLoader = await getModuleLoader(ctx);
            if (!moduleLoader) {
                throw new Error(`No loader found for module: ${moduleName}`);
            }
            lifecycleHooks.onLoad?.(moduleName, ctx);
            const module = await moduleLoader();
            if (validateModule && !validateModule(module)) {
                throw new Error(`Module validation failed for: ${moduleName}`);
            }
            if (enableCache) {
                storage.set(moduleName, {
                    module,
                    expiresAt: Date.now() + cacheTTL,
                });
                lifecycleHooks.onCacheSet?.(moduleName, module, ctx);
            }
            ctx[moduleContextKey] = module;
            if (module.init && typeof module.init === "function") {
                const initResult = await module.init(ctx);
                if (initResult) {
                    return initResult;
                }
            }
            lifecycleHooks.onComplete?.(moduleName, module, ctx);
            GlobalConfig.debugging.success(`Successfully loaded module: ${moduleName}`);
        }
        catch (error) {
            GlobalConfig.debugging.error(`Error loading module: ${moduleName}`, error);
            lifecycleHooks.onError?.(moduleName, error, ctx);
            ctx.setStatus = 500;
            throw error;
        }
        return await next();
    };
};
