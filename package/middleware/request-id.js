import { generateUUID } from "../helper/index.js";
const requestID = (headerName = "X-Request-ID", contextKey = "requestID") => {
    return function requestID(ctx, next) {
        let requestId = ctx.header(headerName);
        if (!requestId) {
            requestId = `req-${generateUUID()}`;
        }
        ctx[contextKey] = requestId;
        ctx.setHeader(headerName, requestId);
        return next();
    };
};
export { requestID, requestID as default, };
