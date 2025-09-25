const poweredBy = (serverName) => {
    return function poweredBy(ctx, next) {
        ctx.headers.set("x-powered-by", serverName || "TezX");
        return next();
    };
};
export { poweredBy, poweredBy as default };
