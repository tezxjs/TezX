export const poweredBy = (serverName) => {
    return function poweredBy(ctx, next) {
        ctx.header("X-Powered-By", serverName || "TezX");
        return next();
    };
};
