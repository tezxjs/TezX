const sanitizeHeaders = (options = {}) => {
    const { whitelist = [], blacklist = [] } = options;
    const normalizedWhitelist = whitelist.map((h) => h.toLowerCase());
    const normalizedBlacklist = blacklist.map((h) => h.toLowerCase());
    let lWhite = normalizedWhitelist.length;
    return async function sanitizeHeaders(ctx, next) {
        await next();
        for (const key of ctx.headers.keys()) {
            if (lWhite > 0 && !normalizedWhitelist.includes(key)) {
                ctx.headers.delete(key);
            }
            if (normalizedBlacklist.includes(key)) {
                ctx.headers.delete(key);
            }
        }
    };
};
export { sanitizeHeaders as default, sanitizeHeaders };
