import { generateID } from "../helper";
export const requestID = (headerName = "X-Request-ID") => {
  return (ctx, next) => {
    const existingID =
      ctx.headers?.get(headerName.toLowerCase()) ||
      ctx.headers?.get(headerName);
    const requestId = existingID || `req-${generateID()}`;
    ctx.state.set("requestID", requestId);
    ctx.header(headerName, requestId);
    return next();
  };
};
