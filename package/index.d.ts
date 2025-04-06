export { Router } from "./core/router";
export type {
  Callback,
  ctx as Context,
  Middleware,
  NextCallback,
  RouterConfig,
  StaticServeOption,
} from "./core/router";
export type { CookieOptions, ResponseHeaders } from "./core/context";
export type {
  AddressType,
  ConnAddress,
  FormDataOptions,
  HTTPMethod,
  Request,
} from "./core/request";
export { TezX } from "./core/server";
export type { TezXConfig } from "./core/server";
export { useParams } from "./utils/params";
export type { UrlRef } from "./utils/url";
export declare let version: string;
