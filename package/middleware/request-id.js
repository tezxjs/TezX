import { generateID } from "../helper/index.js";
export const requestID = (headerName = "X-Request-ID", contextKey = "requestID") => {
    return function requestID(ctx, next) {
        const existingID = ctx.headers?.get(headerName.toLowerCase()) ||
            ctx.headers?.get(headerName);
        const requestId = existingID || `req-${generateID()}`;
        ctx[contextKey] = requestId;
        ctx.header(headerName, requestId);
        return next();
    };
};
