import { generateUUID } from "../helper/index.js";
const requestID = (headerName = "X-Request-ID", contextKey = "requestID") => {
    return function requestID(ctx, next) {
        let requestId = ctx.headers.get(headerName) ?? `req-${generateUUID()}`;
        ctx[contextKey] = requestId;
        ctx.headers.set(headerName, requestId);
        return next();
    };
};
export { requestID as default, requestID };
