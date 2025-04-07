;
export const lazyLoadModules = (options) => {
    const { moduleKey = (ctx) => ctx.req.params[queryKeyModule] || ctx.req.query[queryKeyModule], getModuleLoader, queryKeyModule = "module", moduleContextKey = "module", cacheTTL = 3600000, dependencies = {}, enableCache = true, cacheStorage = new Map(), lifecycleHooks = {}, validateModule } = options;
    return async (ctx, next) => {
        console.log(ctx.pathname?.split("/"));
        let moduleName = moduleKey(ctx) || ctx.req.params[queryKeyModule] || ctx.req.query[queryKeyModule];
        if (!moduleName) {
            console.warn("No module specified for lazy loading.");
            return await next();
        }
        try {
            if (enableCache) {
                const cached = cacheStorage.get(moduleName);
                if (cached) {
                    if (cached.expiresAt > Date.now()) {
                        cacheStorage.delete(moduleName);
                    }
                    else {
                        console.log(`Using cached module: ${moduleName}`);
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
            const moduleLoader = getModuleLoader(ctx);
            if (!moduleLoader) {
                throw new Error(`No loader found for module: ${moduleName}`);
            }
            lifecycleHooks.onLoad?.(moduleName, ctx);
            const module = await moduleLoader();
            if (validateModule && !validateModule(module)) {
                throw new Error(`Module validation failed for: ${moduleName}`);
            }
            ctx.dependencies = dependencies;
            if (module.init && typeof module.init === "function") {
                module.init(dependencies, ctx);
            }
            if (enableCache) {
                cacheStorage.set(moduleName, {
                    module,
                    expiresAt: Date.now() + cacheTTL
                });
                lifecycleHooks.onCacheSet?.(moduleName, module, ctx);
            }
            ctx[moduleContextKey] = module;
            lifecycleHooks.onComplete?.(moduleName, module, ctx);
            console.log(`Successfully loaded module: ${moduleName}`);
        }
        catch (error) {
            console.error(`Error loading module: ${moduleName}`, error);
            lifecycleHooks.onError?.(moduleName, error, ctx);
            ctx.setStatus = 500;
            ctx.body = { error: `Failed to load module: ${moduleName}` };
            return;
        }
        return await next();
    };
};
