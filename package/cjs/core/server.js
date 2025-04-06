"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TezX = void 0;
const config_1 = require("./config");
const context_1 = require("./context");
const router_1 = require("./router");
const colors_1 = require("../utils/colors");
const params_1 = require("../utils/params");
class TezX extends router_1.Router {
  constructor({
    basePath = "/",
    env = {},
    debugMode = false,
    allowDuplicateMw = false,
    overwriteMethod = true,
  } = {}) {
    config_1.GlobalConfig.allowDuplicateMw = allowDuplicateMw;
    config_1.GlobalConfig.overwriteMethod = overwriteMethod;
    if (debugMode) {
      config_1.GlobalConfig.debugMode = debugMode;
    }
    super({ basePath, env });
    this.serve = this.serve.bind(this);
  }
  #hashRouter(method, pathname) {
    const routers = this.routers;
    for (let pattern of this.routers.keys()) {
      const { success, params } = (0, params_1.useParams)({
        path: pathname,
        urlPattern: pattern,
      });
      const handlers =
        routers.get(pattern)?.get(method) || routers.get(pattern)?.get("ALL");
      if (success && handlers) {
        return {
          callback: handlers.callback,
          middlewares: handlers.middlewares,
          params: params,
        };
      }
    }
    return null;
  }
  #triRouter(method, pathname) {
    const parts = pathname.split("/").filter(Boolean);
    const params = {};
    let node = this.triRouter;
    for (let part of parts) {
      if (node.children.has(part)) {
        node = node.children.get(part);
      } else if (node.children.has(":")) {
        node = node.children.get(":");
        if (node.paramName) params[node.paramName] = part;
      } else {
        return null;
      }
    }
    if (node?.handlers?.size && node?.pathname) {
      const handlers = node.handlers.get(method) || node.handlers.get("ALL");
      if (handlers) {
        return {
          middlewares: handlers.middlewares,
          callback: handlers.callback,
          params: params,
        };
      }
      return null;
    }
    return null;
  }
  findRoute(method, pathname) {
    const route =
      this.#triRouter(method, pathname) || this.#hashRouter(method, pathname);
    if (route) {
      return {
        ...route,
        middlewares: [...route.middlewares],
      };
    }
    return null;
  }
  #createHandler(middlewares, finalCallback) {
    return async (ctx) => {
      let index = 0;
      const next = async () => {
        if (index < middlewares.length) {
          return await middlewares[index++](ctx, next);
        } else {
          return await finalCallback(ctx);
        }
      };
      const response = await next();
      if (!response) {
        throw new Error(
          `Handler did not return a response or next() was not called. Path: ${ctx.pathname}, Method: ${ctx.method}`,
        );
      }
      return response;
    };
  }
  #findMiddleware(pathname) {
    const parts = pathname.split("/").filter(Boolean);
    let middlewares = [];
    let node = this.triMiddlewares;
    for (let part of parts) {
      if (node.children.has(part)) {
        node = node.children.get(part);
      } else if (node.children.has("*")) {
        node = node.children.get("*");
      } else if (node.children.has(":")) {
        node = node.children.get(":");
      } else {
        break;
      }
      middlewares.push(...node.middlewares);
    }
    return middlewares;
  }
  async #handleRequest(req, connInfo) {
    let ctx = new context_1.Context(req, connInfo);
    const urlRef = ctx.req.urlRef;
    const { pathname } = urlRef;
    let middlewares = this.#findMiddleware(pathname);
    ctx.env = this.env;
    try {
      let callback = async (ctx) => {
        const find = this.findRoute(ctx.req.method, pathname);
        if (find?.callback) {
          ctx.params = find.params;
          const callback = find.callback;
          let middlewares = find.middlewares;
          return await this.#createHandler(middlewares, callback)(ctx);
        } else {
          let res = await config_1.GlobalConfig.notFound(ctx);
          ctx.setStatus = res.status;
          return res;
        }
      };
      let response = await this.#createHandler(
        [...this.triMiddlewares.middlewares, ...middlewares],
        callback,
      )(ctx);
      let finalResponse = () => {
        return (ctx) => {
          if (response?.headers) {
            ctx.headers.add(response.headers);
          }
          const statusText =
            response?.statusText ||
            context_1.httpStatusMap[response?.status] ||
            "";
          const status = response.status || ctx.getStatus;
          let headers = ctx.headers.toObject();
          return new Response(response.body, {
            status,
            statusText,
            headers,
          });
        };
      };
      return finalResponse()(ctx);
    } catch (err) {
      let error = err;
      if (err instanceof Error) {
        error = err.stack;
      }
      config_1.GlobalConfig.debugging.error(
        `${colors_1.COLORS.bgRed} ${ctx.pathname}, Method: ${ctx.method} ${colors_1.COLORS.reset}`,
        `${context_1.httpStatusMap[500]}: ${error} `,
      );
      let res = await config_1.GlobalConfig.onError(error, ctx);
      ctx.setStatus = res.status;
      return res;
    }
  }
  async serve(req, connInfo) {
    return this.#handleRequest(req, connInfo);
  }
}
exports.TezX = TezX;
