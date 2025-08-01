const poweredBy = (serverName) => {
    return function poweredBy(ctx, next) {
        ctx.setHeader("x-powered-by", serverName || "TezX");
        return next();
    };
};
export { poweredBy, poweredBy as default, };
