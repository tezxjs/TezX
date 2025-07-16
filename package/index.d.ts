import { Router } from "./core/router.js";
import { TezX } from "./core/server.js";
import { compileRegexRoute, regexMatchRoute } from "./utils/regexRouter.js";
export type { Context as BaseContext } from "./core/context.js";
export type { RouterConfig } from "./core/router.js";
export type { AdapterType, NetAddr as AddressType, Callback, CallbackReturn, ConnAddress, ctx as Context, CookieOptions, FormDataOptions, HTTPMethod, Middleware, NextCallback, PathType, ResponseHeaders, StaticServeOption } from "./types/index.js";
export type { TezXConfig, TezXServeOptions } from "./core/server.js";
export type { UrlRef } from "./utils/url.js";
export { compileRegexRoute, regexMatchRoute, Router, TezX };
export declare let version: string;
declare const _default: {
    Router: typeof Router;
    regexMatchRoute: typeof regexMatchRoute;
    compileRegexRoute: typeof compileRegexRoute;
    TezX: typeof TezX;
    version: string;
};
export default _default;
