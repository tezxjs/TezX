export { Router } from "./core/router.js";
export type { Callback, ctx as Context, Middleware, NextCallback, RouterConfig, StaticServeOption } from "./core/router.js";
export type { CookieOptions, ResponseHeaders } from "./core/context.js";
export type { NetAddr as AddressType, ConnAddress, FormDataOptions, HTTPMethod } from "./core/request.js";
export { TezX } from "./core/server.js";
export type { TezXConfig } from "./core/server.js";
export { useParams } from "./utils/params.js";
export type { UrlRef } from "./utils/url.js";
export declare let version: string;
