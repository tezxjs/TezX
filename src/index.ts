import { Router } from "./core/router.js";
import { TezX } from "./core/server.js";
export type { Context as BaseContext } from "./core/context.js";
export type { TezXRequest } from "./core/request.js";
export type { RouterConfig } from "./core/router.js";
export type { TezXConfig } from "./core/server.js";
export type {
  NetAddr as AddressType,
  Callback,
  Ctx as Context,
  CookieOptions,
  ErrorHandler,
  FormDataOptions,
  HandlerType,
  HttpBaseResponse,
  HTTPMethod,
  Middleware,
  NextCallback,
  ReqHeaderKey,
  RequestHeaders,
  ResHeaderKey,
  ResponseHeaders,
  ResponseInit,
  RouteMatchResult,
  RouteRegistry,
  ServeStatic,
  StaticFileArray,
  StaticServeOption
} from "./types/index.js";

export { Router, TezX };
export let version = "4.0.9";
export default {
  Router,
  TezX,
  version
};
