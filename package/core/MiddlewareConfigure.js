import { CommonHandler } from "./common";
import { GlobalConfig } from "./config";
import { sanitizePathSplit } from "../utils/url";
export class TriMiddleware {
  children = new Map();
  middlewares = new Set();
  isOptional = false;
  pathname;
  constructor(pathname = "/") {
    this.pathname = pathname;
    if (GlobalConfig.allowDuplicateMw) {
      this.middlewares = [];
    } else {
      this.middlewares = new Set();
    }
  }
}
export default class MiddlewareConfigure extends CommonHandler {
  triMiddlewares = new TriMiddleware();
  basePath;
  constructor(basePath = "/") {
    super();
    this.basePath = basePath;
  }
  addMiddleware(pathname, middlewares) {
    const parts = sanitizePathSplit(this.basePath, pathname);
    let node = this.triMiddlewares;
    for (const part of parts) {
      if (part.startsWith("*")) {
        if (!node.children.has("*")) {
          node.children.set("*", new TriMiddleware());
        }
        node = node.children.get("*");
      } else if (part.startsWith(":")) {
        const isOptional = part?.endsWith("?");
        if (isOptional) {
          node.isOptional = isOptional;
          continue;
        }
        if (!node.children.has(":")) {
          node.children.set(":", new TriMiddleware());
        }
        node = node.children.get(":");
      } else {
        if (!node.children.has(part)) {
          node.children.set(part, new TriMiddleware());
        }
        node = node.children.get(part);
      }
    }
    if (GlobalConfig.allowDuplicateMw) {
      node.middlewares.push(...middlewares);
    } else {
      for (const middleware of middlewares) {
        node.middlewares.add(middleware);
      }
    }
  }
}
