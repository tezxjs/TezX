export const poweredBy = (serverName) => {
  return (ctx, next) => {
    ctx.header("X-Powered-By", serverName || "TezX");
    return next();
  };
};
