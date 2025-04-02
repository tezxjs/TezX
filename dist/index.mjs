import{createRequire as _pkgrollCR}from"node:module";const require=_pkgrollCR(import.meta.url);let GlobalConfig = class {
  static notFound = (ctx2) => {
    const {
      method,
      urlRef: { pathname }
    } = ctx2.req;
    return ctx2.text(`${method}: '${pathname}' could not find
`, 404);
  };
  static onError = (err, ctx2) => {
    return ctx2.text(err, 500);
  };
  static allowDuplicateMw = false;
  static overwriteMethod = true;
  static enableLogger = false;
  static loggerFn = () => {
    return {};
  };
};

function denoAdapter(TezX2) {
  async function handleRequest(req, x) {
    const response = await TezX2.serve(req);
    if (response instanceof Response) {
      return response;
    } else {
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText || "",
        headers: new Headers(response.headers)
      });
    }
  }
  function listen(port, callback) {
    const isDeno = typeof Deno !== "undefined";
    try {
      const server = isDeno ? Deno.serve({ port }, handleRequest) : null;
      if (!server) {
        throw new Error("Deno is not find");
      }
      const protocol = "\x1B[1;34mhttp\x1B[0m";
      const message = `\x1B[1m\u{1F680} Deno TezX Server running at ${protocol}://localhost:${port}/\x1B[0m`;
      if (typeof callback === "function") {
        callback(message);
      } else {
        const logger = GlobalConfig.loggerFn();
        if (logger.success) {
          logger.success(message);
        }
      }
      return server;
    } catch (err) {
      throw new Error(err?.message);
    }
  }
  return {
    listen
  };
}
function bunAdapter(TezX2) {
  function listen(port, callback) {
    const serve = typeof Bun !== "undefined" ? Bun.serve : null;
    try {
      if (!serve) {
        throw new Error("Bun is not find");
      }
      const server = serve({
        port,
        async fetch(req) {
          const response = await TezX2.serve(req);
          if (response instanceof Response) {
            return response;
          } else {
            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText || "",
              headers: new Headers(response.headers)
            });
          }
        }
      });
      const protocol = "\x1B[1;34mhttp\x1B[0m";
      const message = `\x1B[1m Bun TezX Server running at ${protocol}://localhost:${port}/\x1B[0m`;
      if (typeof callback == "function") {
        callback(message);
      } else {
        const logger = GlobalConfig.loggerFn();
        if (logger.success) {
          logger.success(message);
        }
      }
      return server;
    } catch (err) {
      throw new Error(err?.message);
    }
  }
  return {
    listen
  };
}
function nodeAdapter(TezX2) {
  function listen(port, callback) {
    import('http').then((r) => {
      let server = r.createServer(async (req, res) => {
        const response = await TezX2.serve(req);
        const statusText = response?.statusText;
        if (!(response instanceof Response)) {
          throw new Error("Invalid response from TezX.serve");
        }
        const headers = Object.fromEntries(await response.headers.entries());
        if (statusText) {
          res.statusMessage = statusText;
        }
        res.writeHead(response.status, headers);
        const { Readable } = await import('stream');
        if (response.body instanceof Readable) {
          response.body.pipe(res);
        } else {
          const body = await response.arrayBuffer();
          res.end(Buffer.from(body));
        }
      });
      server.listen(port, () => {
        const protocol = "\x1B[1;34mhttp\x1B[0m";
        const message = `\x1B[1m NodeJS TezX Server running at ${protocol}://localhost:${port}/\x1B[0m`;
        if (typeof callback == "function") {
          callback(message);
        } else {
          const logger = GlobalConfig.loggerFn();
          if (logger.success) {
            logger.success(message);
          }
        }
        return server;
      });
    }).catch((r) => {
      throw Error(r.message);
    });
  }
  return {
    listen
  };
}

class CommonHandler {
  /**
   * Register a custom 404 handler for missing routes
   * @param {Callback} callback - Handler function to execute when no route matches
   * @returns {this} - Returns current instance for chaining
   *
   * @example
   * // Register a custom not-found handler
   * app.notFound((ctx) => {
   *   ctx.status(404).text('Custom not found message');
   * });
   */
  notFound(callback) {
    GlobalConfig.notFound = callback;
    return this;
  }
  onError(callback) {
    GlobalConfig.onError = callback;
    return this;
  }
}

function sanitizePathSplit(basePath, path) {
  const parts = `${basePath}/${path}`.replace(/\\/g, "")?.split("/").filter(Boolean);
  return parts;
}
function urlParse(url) {
  const urlPattern = /^(?:(\w+):\/\/)?(?:([^:@]+)?(?::([^@]+))?@)?([^:/?#]+)?(?::(\d+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;
  let matches = url.match(urlPattern);
  const [
    _,
    protocol,
    username,
    password,
    hostname,
    port,
    path,
    queryString,
    hash
  ] = matches;
  let origin = hostname;
  if (protocol) {
    origin = protocol + "://" + hostname;
  }
  if (port) {
    origin = origin + ":" + port;
  }
  let p = path;
  if (p?.endsWith("/")) p.slice(0, -1);
  function query() {
    if (queryString) {
      const queryPart = decodeURIComponent(queryString);
      const keyValuePairs = queryPart.split("&");
      const paramsObj = keyValuePairs?.map(
        (keyValue) => {
          const [key, value] = keyValue.split("=");
          return {
            [key]: value
          };
        }
      );
      return paramsObj.reduce(function(total, value) {
        return { ...total, ...value };
      }, {});
    } else {
      return {};
    }
  }
  return {
    pathname: p,
    hash,
    protocol,
    origin,
    username,
    password,
    hostname,
    href: url,
    port,
    query: query()
  };
}

class TriMiddleware {
  children = /* @__PURE__ */ new Map();
  middlewares = /* @__PURE__ */ new Set();
  isOptional = false;
  pathname;
  constructor(pathname = "/") {
    this.pathname = pathname;
    if (GlobalConfig.allowDuplicateMw) {
      this.middlewares = [];
    } else {
      this.middlewares = /* @__PURE__ */ new Set();
    }
  }
}
class MiddlewareConfigure extends CommonHandler {
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

class EnvironmentDetector {
  static get getEnvironment() {
    if (typeof Bun !== "undefined") return "bun";
    if (typeof Deno !== "undefined") return "deno";
    if (typeof process !== "undefined" && process.versions?.node) return "node";
    return "unknown";
  }
  static detectProtocol(req) {
    try {
      if (this.getEnvironment === "node") {
        return req?.socket?.encrypted ? "https" : "http";
      }
      return "unknown";
    } catch (error) {
      throw new Error("Failed to detect protocol.");
    }
  }
  static getHost(headers) {
    try {
      return headers?.get("host") || "unknown";
    } catch (error) {
      throw new Error("Failed to get host.");
    }
  }
}

const mimeTypes = {
  // Text/Web Formats
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  js: "text/javascript",
  mjs: "text/javascript",
  json: "application/json",
  xml: "application/xml",
  txt: "text/plain",
  md: "text/markdown",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  rtf: "application/rtf",
  markdown: "text/markdown",
  // Image Formats
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  ico: "image/x-icon",
  bmp: "image/bmp",
  tiff: "image/tiff",
  psd: "image/vnd.adobe.photoshop",
  // Video Formats
  mp4: "video/mp4",
  webm: "video/webm",
  ogg: "video/ogg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  wmv: "video/x-ms-wmv",
  flv: "video/x-flv",
  "3gp": "video/3gpp",
  // Audio Formats
  mp3: "audio/mpeg",
  wav: "audio/wav",
  aac: "audio/aac",
  flac: "audio/flac",
  m4a: "audio/mp4",
  mid: "audio/midi",
  midi: "audio/midi",
  // Font Formats
  woff: "font/woff",
  woff2: "font/woff2",
  ttf: "font/ttf",
  otf: "font/otf",
  eot: "application/vnd.ms-fontobject",
  // Application/Document Formats
  pdf: "application/pdf",
  odp: "application/vnd.oasis.opendocument.presentation",
  zip: "application/zip",
  gz: "application/gzip",
  tar: "application/x-tar",
  rar: "application/x-rar-compressed",
  _7z: "application/x-7z-compressed",
  bz2: "application/x-bzip2",
  "7z": "application/x-7z-compressed",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  // Programming/Data Formats
  wasm: "application/wasm",
  map: "application/json",
  // Source maps
  yaml: "application/yaml",
  yml: "application/yaml",
  proto: "text/plain",
  graphql: "application/graphql",
  // Security/Config Formats
  pem: "application/x-pem-file",
  cer: "application/pkix-cert",
  crt: "application/x-x509-ca-cert",
  key: "application/x-pem-file",
  pfx: "application/x-pkcs12",
  // 3D/Model Formats
  glb: "model/gltf-binary",
  gltf: "model/gltf+json",
  obj: "model/obj",
  stl: "model/stl",
  // Virtual/Mixed Reality
  usdz: "model/vnd.usdz+zip",
  // System Formats
  exe: "application/x-msdownload",
  dmg: "application/x-apple-diskimage",
  deb: "application/x-debian-package",
  rpm: "application/x-redhat-package-manager",
  apk: "application/vnd.android.package-archive",
  // Special Web Formats
  webmanifest: "application/manifest+json",
  ics: "text/calendar",
  vcf: "text/vcard",
  warc: "application/warc",
  atom: "application/atom+xml",
  rss: "application/rss+xml",
  // Executables and scripts
  dll: "application/x-msdownload",
  sh: "application/x-sh",
  py: "text/x-python",
  rb: "text/x-ruby",
  pl: "text/x-perl",
  php: "application/x-httpd-php",
  // Miscellaneous
  torrent: "application/x-bittorrent",
  ipa: "application/vnd.iphone",
  eps: "application/postscript",
  ps: "application/postscript",
  ai: "application/postscript",
  swf: "application/x-shockwave-flash",
  jar: "application/java-archive",
  gcode: "text/x.gcode"
};
const defaultMimeType = "application/octet-stream";
async function getFiles(dir, basePath = "/", ref, option) {
  const files = [];
  const runtime = EnvironmentDetector.getEnvironment;
  if (runtime == "deno") {
    for await (const entry of Deno.readDir(dir)) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory) {
        files.push(
          ...await getFiles(path, `${basePath}/${entry.name}`, ref, option)
        );
      } else {
        const x = `${basePath}/${entry.name}`;
        files.push({
          file: path,
          path: x.replace(/\\/g, "/")
        });
      }
    }
  } else {
    const fs = await import('fs/promises');
    const path = await import('path');
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(
          ...await getFiles(
            fullPath,
            `${basePath}/${entry.name}`,
            ref,
            option
          )
        );
      } else {
        const path2 = `${basePath}/${entry.name}`;
        files.push({
          file: fullPath,
          path: path2.replace(/\\/g, "/")
        });
      }
    }
  }
  files.forEach((r) => {
    ref.get(r.path, (ctx2) => {
      if (option.cacheControl) {
        ctx2.headers.set("Cache-Control", option.cacheControl);
      }
      if (option.headers) {
        ctx2.headers.add(option.headers);
      }
      return ctx2.sendFile(r.file);
    });
  });
  return files;
}

class TrieRouter {
  children = /* @__PURE__ */ new Map();
  // handlers: Map<HTTPMethod, Callback<any>> = new Map();
  handlers = /* @__PURE__ */ new Map();
  pathname;
  // isWildcard: boolean = false;
  paramName;
  isParam = false;
  constructor(pathname = "/") {
    this.children = /* @__PURE__ */ new Map();
    this.pathname = pathname;
  }
}
class Router extends MiddlewareConfigure {
  routers = /* @__PURE__ */ new Map();
  env = {};
  triRouter;
  constructor({ basePath = "/", env = {} } = {}) {
    super(basePath);
    this.basePath = basePath;
    this.env = { ...env };
    this.triRouter = new TrieRouter(basePath);
    this.get.bind(this);
    this.post.bind(this);
    this.put.bind(this);
    this.delete.bind(this);
    this.all.bind(this);
    this.#routeAddTriNode.bind(this);
    this.addRouter.bind(this);
    this.group.bind(this);
  }
  static(...args) {
    let route = "";
    let dir;
    let options = {};
    switch (args.length) {
      case 3:
        [route, dir, options] = args;
        break;
      case 2:
        if (typeof args[1] === "object") {
          [dir, options] = args;
        } else {
          [route, dir] = args;
        }
        break;
      case 1:
        [dir] = args;
        break;
      default:
        throw new Error(
          `\x1B[1;31m404 Not Found\x1B[0m \x1B[1;32mInvalid arguments\x1B[0m`
        );
    }
    getFiles(dir, route, this, options);
    return this;
  }
  get(path, ...args) {
    this.#registerRoute("GET", path, ...args);
    return this;
  }
  post(path, ...args) {
    this.#registerRoute("POST", path, ...args);
    return this;
  }
  put(path, ...args) {
    this.#registerRoute("PUT", path, ...args);
    return this;
  }
  patch(path, ...args) {
    this.#registerRoute("PATCH", path, ...args);
    return this;
  }
  delete(path, ...args) {
    this.#registerRoute("DELETE", path, ...args);
    return this;
  }
  options(path, ...args) {
    this.#registerRoute("OPTIONS", path, ...args);
    return this;
  }
  head(path, ...args) {
    this.#registerRoute("HEAD", path, ...args);
    return this;
  }
  all(path, ...args) {
    this.#registerRoute("ALL", path, ...args);
    return this;
  }
  addRoute(method, path, ...args) {
    this.#registerRoute(method, path, ...args);
    return this;
  }
  /**
   * Mount a sub-router at specific path prefix
   * @param path - Base path for the sub-router
   * @param router - Router instance to mount
   * @returns Current instance for chaining
   *
   * @example
   * const apiRouter = new Router();
   * apiRouter.get('/users', () => { ... });
   * server.addRouter('/api', apiRouter);
   */
  addRouter(path, router) {
    return this.#routeAddTriNode(path, router);
  }
  /**
   * Create route group with shared path prefix
   * @param prefix - Path prefix for the group
   * @param callback - Function that receives group-specific router
   * @returns Current router instance for chaining
   *
   * @example
   * app.group('/v1', (group) => {
   *   group.get('/users', v1UserHandler);
   * });
   */
  group(prefix, callback) {
    const router = new Router({
      basePath: prefix
      // env: this.env
    });
    callback(router);
    this.#routeAddTriNode("/", router);
    return this;
  }
  use(...args) {
    let path = "/";
    let middlewares = [];
    let router;
    if (typeof args[0] === "string") {
      path = args[0];
      if (Array.isArray(args[1])) {
        middlewares = args[1];
        router = args[2];
      } else if (typeof args[1] === "function") {
        middlewares = [args[1]];
        router = args[2];
      } else {
        router = args[1];
      }
    } else if (typeof args[0] === "function") {
      if (args.length === 1) {
        middlewares = [args[0]];
      } else {
        middlewares = [args[0]];
        router = args[1];
      }
    } else if (Array.isArray(args[0])) {
      middlewares = args[0];
      router = args[1];
    } else if (args[0] instanceof Router) {
      router = args[0];
    }
    this.#addRouteMiddleware(path, middlewares);
    if (router && router instanceof Router) {
      this.addRouter(path, router);
    }
    return this;
  }
  // Other HTTP methods (PUT, DELETE, etc.) can be added similarly
  #registerRoute(method, path, ...args) {
    if (args.length === 0) {
      throw new Error("At least one handler is required.");
    }
    let middlewares = [];
    let callback;
    if (args.length > 1) {
      if (Array.isArray(args[0])) {
        middlewares = args[0];
      } else if (typeof args[0] === "function") {
        middlewares = [args[0]];
      }
      callback = args[args.length - 1];
    } else {
      callback = args[0];
    }
    if (typeof callback !== "function") {
      throw new Error("Route callback function is missing or invalid.");
    }
    if (!middlewares.every((middleware) => typeof middleware === "function")) {
      throw new Error(
        "Middleware must be a function or an array of functions."
      );
    }
    this.#addRoute(method, path, callback, middlewares);
  }
  #addRoute(method, path, callback, middlewares) {
    const parts = sanitizePathSplit(this.basePath, path);
    let finalMiddleware = middlewares;
    if (!GlobalConfig.allowDuplicateMw) {
      finalMiddleware = new Set(middlewares);
    }
    let p = parts.join("/");
    if (/(\/\*|\?)/.test(p)) {
      let handler = this.routers.get(p);
      if (!handler) {
        handler = /* @__PURE__ */ new Map();
        handler.set(method, {
          callback,
          middlewares: finalMiddleware
        });
        return this.routers.set(p, handler);
      }
      if (!GlobalConfig.overwriteMethod && handler.has(method)) return;
      return handler.set(method, { callback, middlewares: finalMiddleware });
    }
    let node = this.triRouter;
    for (const part of parts) {
      if (part.startsWith(":")) {
        if (!node.children.has(":")) {
          node.children.set(":", new TrieRouter());
        }
        node = node.children.get(":");
        node.isParam = true;
        if (!node.paramName) {
          node.paramName = part.slice(1);
        }
      } else {
        if (!node.children.has(part)) {
          node.children.set(part, new TrieRouter());
        }
        node = node.children.get(part);
      }
    }
    if (!GlobalConfig.overwriteMethod && node.handlers.has(method)) return;
    node.handlers.set(method, {
      callback,
      middlewares: finalMiddleware
    });
    node.pathname = path;
  }
  #addRouteMiddleware(path, middlewareFunctions) {
    this.addMiddleware(path, middlewareFunctions);
  }
  #routeAddTriNode(path, router) {
    this.env = { ...this.env, ...router.env };
    if (!(router instanceof Router)) {
      throw new Error("Router instance is required.");
    }
    const parts = sanitizePathSplit(this.basePath, path);
    if (router.routers.size) {
      for (const [segment, handlers] of router.routers) {
        let path2 = parts.length ? parts.join("/") + "/" + segment : segment;
        if (this.routers.has(path2)) {
          const baseRouter = this.routers.get(path2);
          for (const [method, handler] of handlers) {
            if (!GlobalConfig.overwriteMethod && baseRouter.has(method)) return;
            baseRouter.set(method, handler);
          }
        } else {
          this.routers.set(path2, new Map(handlers));
        }
      }
    }
    let rootNode = this.triRouter;
    let rootMiddlewares = this.triMiddlewares;
    if (parts.length == 0) {
      this.#addMiddlewareHandlerIDsTriNode(rootNode, rootMiddlewares, router);
    } else {
      for (const part of parts) {
        if (part.startsWith(":")) {
          if (!rootNode.children.has(":")) {
            rootNode.children.set(":", new TrieRouter());
          }
          rootNode = rootNode.children.get(":");
          rootNode.isParam = true;
          if (!rootNode.paramName) {
            rootNode.paramName = part.slice(1);
          }
        } else {
          if (!rootNode.children.has(part)) {
            rootNode.children.set(part, new TrieRouter());
          }
          rootNode = rootNode.children.get(part);
        }
      }
      for (const part of parts) {
        if (part.startsWith("*")) {
          if (!rootMiddlewares.children.has("*")) {
            rootMiddlewares.children.set("*", new TriMiddleware());
          }
          rootMiddlewares = rootMiddlewares.children.get("*");
        } else if (part.startsWith(":")) {
          const isOptional = part?.endsWith("?");
          if (isOptional) {
            rootMiddlewares.isOptional = isOptional;
            continue;
          }
          if (!rootMiddlewares.children.has(":")) {
            rootMiddlewares.children.set(":", new TriMiddleware());
          }
          rootMiddlewares = rootMiddlewares.children.get(":");
        } else {
          if (!rootMiddlewares.children.has(part)) {
            rootMiddlewares.children.set(part, new TriMiddleware());
          }
          rootMiddlewares = rootMiddlewares.children.get(part);
        }
      }
      this.#addMiddlewareHandlerIDsTriNode(rootNode, rootMiddlewares, router);
    }
  }
  #addMiddlewareHandlerIDsTriNode(rootNode, rootMiddlewares, router) {
    function addSubRouter(children, node) {
      let rtN = node;
      for (const element of children) {
        const pathSegment = element[0];
        const subRouter = element[1];
        if (rtN.children.has(pathSegment)) {
          let findNode = rtN.children.get(pathSegment);
          for (const [method, handlers] of subRouter.handlers) {
            if (!GlobalConfig.overwriteMethod && node.handlers.has(method))
              return;
            findNode.handlers.set(method, handlers);
          }
          if (subRouter.children.size) {
            addSubRouter(subRouter.children, findNode);
          }
        } else {
          rtN.children.set(pathSegment, subRouter);
        }
      }
    }
    let routerNode = router.triRouter;
    const routerMiddlewares = router.triMiddlewares;
    for (const [method, handlers] of routerNode.handlers) {
      if (!GlobalConfig.overwriteMethod) {
        rootNode.handlers.set(method, handlers);
        continue;
      }
      if (!rootNode.handlers.has(method)) {
        rootNode.handlers.set(method, handlers);
      }
    }
    if (routerNode.children.size > 0) {
      addSubRouter(routerNode.children, rootNode);
    }
    function addMiddleware(children, node) {
      let n = node;
      for (const [path, middlewareNode] of children) {
        if (n.children.has(path)) {
          let findNode = n.children.get(path);
          if (GlobalConfig.allowDuplicateMw) {
            findNode.middlewares.push(
              ...middlewareNode.middlewares
            );
          } else {
            for (const mw of middlewareNode.middlewares) {
              if (findNode.middlewares.has(mw)) {
                middlewareNode.middlewares.delete(mw);
              }
              findNode.middlewares.add(mw);
            }
          }
          if (middlewareNode.children.size) {
            addMiddleware(middlewareNode.children, findNode);
          }
        } else {
          n.children.set(path, middlewareNode);
        }
      }
    }
    if (GlobalConfig.allowDuplicateMw) {
      rootMiddlewares.middlewares.push(
        ...routerMiddlewares.middlewares
      );
    } else {
      for (const mw of routerMiddlewares.middlewares) {
        if (rootMiddlewares.middlewares.has(mw)) {
          routerMiddlewares.middlewares.delete(mw);
        }
        rootMiddlewares.middlewares.add(mw);
      }
    }
    if (routerMiddlewares.children.size > 0) {
      addMiddleware(routerMiddlewares.children, rootMiddlewares);
    }
  }
}

class HeadersParser {
  headers = /* @__PURE__ */ new Map();
  // Lowercase keys for case-insensitivity
  constructor(init) {
    if (init) {
      this.add(init);
    }
  }
  /**
   * Adds multiple headers to the parser.
   * @param headers - Headers as an array of tuples or a record object.
   */
  add(headers) {
    if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        this.set(key, value);
      }
    } else if (typeof Headers !== "undefined" && headers instanceof Headers) {
      for (const [key, value] of headers.entries()) {
        this.set(key, value);
      }
    } else if (typeof headers === "object") {
      for (const key in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, key)) {
          this.set(key, headers[key]);
        }
      }
    }
    return this;
  }
  /**
   * Sets a header value.
   * @param key - Header name.
   * @param value - Header value(s).
   */
  set(key, value) {
    this.headers.set(key.toLowerCase(), Array.isArray(value) ? value : [value]);
    return this;
  }
  /**
   * Retrieves the first value of a header.
   * @param key - Header name.
   * @returns The first header value or undefined if not found.
   */
  get(key) {
    const values = this.headers.get(key.toLowerCase());
    return values ? values[0] : void 0;
  }
  /**
   * Retrieves all values of a header.
   * @param key - Header name.
   * @returns An array of header values.
   */
  getAll(key) {
    return this.headers.get(key.toLowerCase()) || [];
  }
  /**
   * Checks if a header exists.
   * @param key - Header name.
   * @returns True if the header exists, false otherwise.
   */
  has(key) {
    return this.headers.has(key.toLowerCase());
  }
  /**
   * Deletes a header.
   * @param key - Header name.
   * @returns True if deleted successfully, false otherwise.
   */
  delete(key) {
    return this.headers.delete(key.toLowerCase());
  }
  /**
   * Appends a value to an existing header or creates a new one.
   * @param key - Header name.
   * @param value - Value to append.
   */
  append(key, value) {
    const lowerKey = key.toLowerCase();
    if (this.headers.has(lowerKey)) {
      this.headers.get(lowerKey).push(value);
    } else {
      this.headers.set(lowerKey, [value]);
    }
    return this;
  }
  /**
   * Returns an iterator over header entries.
   * @returns IterableIterator of header key-value pairs.
   */
  entries() {
    return this.headers.entries();
  }
  /**
   * Returns an iterator over header keys.
   * @returns IterableIterator of header names.
   */
  keys() {
    return this.headers.keys();
  }
  /**
   * Returns an iterator over header values.
   * @returns IterableIterator of header values arrays.
   */
  values() {
    return this.headers.values();
  }
  /**
   * Iterates over headers and executes a callback function.
   * @param callback - Function to execute for each header.
   */
  forEach(callback) {
    for (const [key, value] of this.headers) {
      callback(value, key);
    }
  }
  /**
   * Converts headers into a plain object.
   * @returns A record of headers where single-value headers are returned as a string.
   */
  toObject() {
    const obj = {};
    for (const [key, value] of this.headers.entries()) {
      obj[key] = value.length > 1 ? value : value[0];
    }
    return obj;
  }
}
Object.defineProperty(HeadersParser, "name", { value: "Headers" });

async function parseJsonBody(req) {
  const runtime = EnvironmentDetector.getEnvironment;
  if (runtime === "node") {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(new Error("Invalid JSON format"));
        }
      });
    });
  } else if (runtime === "deno" || runtime === "bun") {
    return await req.json();
  } else {
    throw new Error("Unsupported environment for multipart parsing");
  }
}
async function parseTextBody(req) {
  const runtime = EnvironmentDetector.getEnvironment;
  if (runtime === "node") {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", () => {
        try {
          resolve(body);
        } catch (error) {
          reject(new Error("Invalid JSON format"));
        }
      });
    });
  } else if (runtime === "deno" || runtime === "bun") {
    return await req.text();
  } else {
    throw new Error("Unsupported environment for multipart parsing");
  }
}
async function parseUrlEncodedBody(req) {
  const runtime = EnvironmentDetector.getEnvironment;
  if (runtime === "node") {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString("binary");
      });
      req.on("end", () => {
        try {
          const pairs = body.split("&");
          const formData = {};
          pairs.forEach((pair) => {
            const [key, value] = pair.split("=");
            formData[decodeURIComponent(key)] = decodeURIComponent(value || "");
          });
          resolve(formData);
        } catch {
          reject(new Error("Invalid x-www-form-urlencoded format"));
        }
      });
    });
  } else if (runtime === "deno" || runtime === "bun") {
    const formData = await req.formData();
    const result = {};
    for (const [key, value] of formData.entries()) {
      result[key] = value;
    }
    return result;
  } else {
    throw new Error("Unsupported environment for multipart parsing");
  }
}
async function parseMultipartBody(req, boundary, options) {
  const runtime = EnvironmentDetector.getEnvironment;
  options?.sanitized;
  if (runtime === "node") {
    return new Promise((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString("binary");
      });
      req.on("end", () => {
        try {
          const formDataField = {};
          const formDataFieldParts = body.split("----------------------------");
          formDataFieldParts.forEach((part) => {
            const match = part.match(/name="(.*)"\r\n\r\n(.*)\r\n/);
            if (match && match.length === 3) {
              const name = match[1];
              const value = match[2];
              formDataField[name] = value;
            }
          });
          const parts = body.split(`--${boundary}`);
          for (const part of parts) {
            if (part.includes("filename")) {
              const filenameMatch = part.match(/filename="([^"]+)"/);
              const fieldNameMatch = part.match(/name="([^"]+)"/);
              const contentTypeMatch = part.match(/Content-Type: ([^\r\n]+)/);
              if (filenameMatch && fieldNameMatch && contentTypeMatch) {
                let filename = filenameMatch[1];
                const fieldName = fieldNameMatch[1];
                const contentType = contentTypeMatch[1];
                if (options?.sanitized) {
                  filename = `${Date.now()}-${filename.replace(/\s+/g, "")?.replace(/[^a-zA-Z0-9.-]/g, "-")}`?.toLowerCase();
                }
                if (Array.isArray(options?.allowedTypes) && !options.allowedTypes?.includes(contentType)) {
                  reject(
                    `Invalid file type: "${contentType}". Allowed types: ${options.allowedTypes.join(", ")}`
                  );
                }
                const fileContentStartIndex = part.indexOf("\r\n\r\n") + 4;
                const fileContent = Buffer.from(
                  part.substring(fileContentStartIndex),
                  "binary"
                );
                const arrayBuffer = fileContent.buffer.slice(
                  fileContent.byteOffset,
                  fileContent.byteOffset + fileContent.byteLength
                );
                if (typeof options?.maxSize !== "undefined" && fileContent.byteLength > options.maxSize) {
                  reject(
                    `File size exceeds the limit: ${fileContent.byteLength} bytes (Max: ${options.maxSize} bytes)`
                  );
                }
                const file = new File([arrayBuffer], filename, {
                  type: contentType
                });
                if (typeof options?.maxFiles != "undefined" && options.maxFiles == 0) {
                  reject(
                    `Field "${fieldName}" exceeds the maximum allowed file count of ${options.maxFiles}.`
                  );
                }
                if (formDataField[fieldName]) {
                  if (Array.isArray(formDataField[fieldName])) {
                    if (typeof options?.maxFiles != "undefined" && formDataField[fieldName]?.length >= options.maxFiles) {
                      reject(
                        `Field "${fieldName}" exceeds the maximum allowed file count of ${options.maxFiles}.`
                      );
                    }
                    formDataField[fieldName].push(file);
                  } else {
                    formDataField[fieldName] = [formDataField[fieldName], file];
                  }
                } else {
                  formDataField[fieldName] = file;
                }
              }
            }
          }
          resolve(formDataField);
        } catch {
        }
      });
    });
  } else if (runtime === "deno" || runtime === "bun") {
    const formData = await req.formData();
    const result = {};
    for (const [key, value] of formData.entries()) {
      let val = value;
      if (val instanceof File && typeof options == "object") {
        let filename = val.name;
        if (options?.sanitized) {
          filename = `${Date.now()}-${filename.replace(/\s+/g, "")?.replace(/[^a-zA-Z0-9.-]/g, "-")}`?.toLowerCase();
        }
        if (Array.isArray(options?.allowedTypes) && !options.allowedTypes?.includes(val.type)) {
          throw new Error(
            `Invalid file type: "${val.type}". Allowed types: ${options.allowedTypes.join(", ")}`
          );
        }
        if (typeof options?.maxSize !== "undefined" && val.size > options.maxSize) {
          throw new Error(
            `File size exceeds the limit: ${val.size} bytes (Max: ${options.maxSize} bytes)`
          );
        }
        if (typeof options?.maxFiles != "undefined" && options.maxFiles == 0) {
          throw new Error(
            `Field "${key}" exceeds the maximum allowed file count of ${options.maxFiles}.`
          );
        }
        val = new File([await val.arrayBuffer()], filename, {
          type: val.type
        });
      }
      if (result[key]) {
        if (Array.isArray(result[key])) {
          if (val instanceof File && typeof options?.maxFiles != "undefined" && result[key]?.length >= options.maxFiles) {
            throw new Error(
              `Field "${key}" exceeds the maximum allowed file count of ${options.maxFiles}.`
            );
          }
          result[key].push(val);
        } else {
          result[key] = [result[key], val];
        }
      } else {
        result[key] = val;
      }
    }
    return result;
  } else {
    throw new Error("Unsupported environment for multipart parsing");
  }
}

class Request {
  headers = new HeadersParser();
  /**
   * Full request URL including protocol and query string
   * @type {string}
   */
  url;
  /**
   * HTTP request method (GET, POST, PUT, DELETE, etc.)
   * @type {HTTPMethod}
   */
  method;
  /** Parsed URL reference containing components like query parameters, pathname, etc. */
  urlRef = {
    hash: void 0,
    protocol: void 0,
    origin: void 0,
    username: void 0,
    password: void 0,
    hostname: void 0,
    port: void 0,
    href: void 0,
    query: {},
    pathname: "/"
  };
  /** Query parameters extracted from the URL */
  query;
  #request;
  /**
   * Retrieve a parameter by name.
   * @param name - The parameter name.
   * @returns The parameter value if found, or undefined.
   */
  params = {};
  // static statusText: string;
  // static bodyUsed: boolean;
  constructor(req, params) {
    this.headers = new HeadersParser(req?.headers);
    this.method = req?.method?.toUpperCase();
    this.params = params;
    this.#request = req;
    if (EnvironmentDetector.getEnvironment == "node") {
      const protocol = EnvironmentDetector.detectProtocol(req);
      const host = EnvironmentDetector.getHost(this.headers);
      this.url = `${protocol}://${host}${req.url}`;
    } else {
      this.url = req.url;
    }
    this.urlRef = urlParse(this.url);
    this.query = this.urlRef.query;
  }
  /**
   * Parses the request body as plain text.
   * @returns {Promise<string>} The text content of the request body.
   */
  async text() {
    return await parseTextBody(this.#request);
  }
  /**
   * Parses the request body as JSON.
   * @returns {Promise<Record<string, any>>} The parsed JSON object.
   * If the Content-Type is not 'application/json', it returns an empty object.
   */
  async json() {
    const contentType = this.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return await parseJsonBody(this.#request);
    } else {
      return {};
    }
  }
  /**
   * Parses the request body based on Content-Type.
   * Supports:
   * - application/json → JSON parsing
   * - application/x-www-form-urlencoded → URL-encoded form parsing
   * - multipart/form-data → Multipart form-data parsing (for file uploads)
   * @returns {Promise<Record<string, any>>} The parsed form data as an object.
   * @throws {Error} If the Content-Type is missing or invalid.
   */
  async formData(options) {
    const contentType = this.headers.get("content-type") || "";
    if (!contentType) {
      throw Error("Invalid Content-Type");
    }
    if (contentType.includes("application/json")) {
      return await parseJsonBody(this.#request);
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      return parseUrlEncodedBody(this.#request);
    } else if (contentType.includes("multipart/form-data")) {
      const boundary = contentType?.split("; ")?.[1]?.split("=")?.[1];
      if (!boundary) {
        throw Error("Boundary not found");
      }
      return await parseMultipartBody(this.#request, boundary, options);
    } else {
      return {};
    }
  }
}

class State {
  state;
  constructor() {
    this.state = /* @__PURE__ */ new Map();
  }
  /**
   * Store a value with a specific key.
   * @param key - The key for the value.
   * @param value - The value to be stored.
   */
  set(key, value) {
    this.state.set(key, value);
  }
  /**
   * Retrieve a value by key.
   * @param key - The key of the value to retrieve.
   * @returns The stored value or undefined if not found.
   */
  get(key) {
    return this.state.get(key);
  }
  /**
   * Delete a key from storage.
   * @param key - The key to remove.
   * @returns True if the key was deleted, false otherwise.
   */
  delete(key) {
    return this.state.delete(key);
  }
  /**
   * Check if a key exists in the storage.
   * @param key - The key to check.
   * @returns True if the key exists, false otherwise.
   */
  has(key) {
    return this.state.has(key);
  }
  /**
   * Get an array of all stored keys.
   * @returns An array of keys.
   */
  keys() {
    return Array.from(this.state.keys());
  }
  /**
   * Get an array of all stored values.
   * @returns An array of values.
   */
  values() {
    return Array.from(this.state.values());
  }
  /**
   * Get an array of all key-value pairs.
   * @returns An array of [key, value] tuples.
   */
  entries() {
    return Array.from(this.state.entries());
  }
  /**
   * Remove all entries from storage.
   */
  clear() {
    this.state.clear();
  }
}

const httpStatusMap = {
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  306: "Switch Proxy",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot",
  421: "Misdirected Request",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required"
};
class Context {
  #rawRequest;
  /**
   * Environment variables and configuration
   * @type {object}
   */
  env = {};
  /**
   * Parser for handling and manipulating HTTP headers
   * @type {HeadersParser}
   */
  headers = new HeadersParser();
  /**
   * Parser for handling and manipulating HTTP response(Read Only)
   * @type {Response}
   */
  res;
  /**
   * Request path without query parameters
   * @type {string}
   */
  pathname;
  /**
   * Full request URL including protocol and query string
   * @type {string}
   */
  url;
  /**
   * HTTP request method (GET, POST, PUT, DELETE, etc.)
   * @type {HTTPMethod}
   */
  method;
  #status = 200;
  /**
   * Public state container for application data
   * state storage for middleware and plugins
   * @type {State}
   */
  state = new State();
  /**
   * URL parameters extracted from route
   * @private
   * @type {Record<string, any>}
   */
  #params = {};
  // /**
  //  * WebSocket connection instance (null until upgraded)
  //  * @type {WebSocket | null}
  //  */
  // ws: WebSocket | null = null;
  /**
   * Flag indicating if the request processing is complete
   * @type {boolean}
   */
  finalized = false;
  constructor(req) {
    this.#rawRequest = req;
    this.method = req?.method?.toUpperCase();
    this.pathname = this.req.urlRef.pathname;
    this.url = this.req.url;
  }
  /**
   * Cookie handling utility with get/set/delete operations
   * @returns {{
   *  get: (name: string) => string | undefined,
   *  all: () => Record<string, string>,
   *  delete: (name: string, options?: CookieOptions) => void,
   *  set: (name: string, value: string, options?: CookieOptions) => void
   * }} Cookie handling interface
   */
  /**
  * Sets a header value.
  * @param key - Header name.
  * @param value - Header value(s).
  */
  header(key, value) {
    this.headers.set(key, value);
    return this;
  }
  get cookies() {
    const c = this.headers.getAll("cookie");
    let cookies = {};
    if (Array.isArray(c) && c.length != 0) {
      const cookieHeader = c.join("; ").split(";");
      for (const pair of cookieHeader) {
        const [key, value] = pair?.trim()?.split("=");
        cookies[key] = decodeURIComponent(value);
      }
    } else if (typeof c == "string") {
      const cookieHeader = c.split(";");
      for (const pair of cookieHeader) {
        const [key, value] = pair?.trim()?.split("=");
        cookies[key] = decodeURIComponent(value);
      }
    }
    return {
      /**
       * Get a specific cookie by name.
       * @param {string} cookie - The name of the cookie to retrieve.
       * @returns {string | undefined} - The cookie value or undefined if not found.
       */
      get: (cookie) => {
        return cookies?.[cookie];
      },
      /**
       * Get all cookies as an object.
       * @returns {Record<string, string>} - An object containing all cookies.
       */
      all: () => {
        return cookies;
      },
      /**
       * Delete a cookie by setting its expiration to the past.
       * @param {string} name - The name of the cookie to delete.
       * @param {CookieOptions} [options] - Additional cookie options.
       */
      delete: (name, options) => {
        const value = "";
        const cookieOptions = {
          ...options,
          expires: /* @__PURE__ */ new Date(0)
          // Set expiration time to the past
        };
        const cookieHeader = `${name}=${value};${serializeOptions(cookieOptions)}`;
        this.headers.set("Set-Cookie", cookieHeader);
      },
      /**
       * Set a new cookie with the given name, value, and options.
       * @param {string} name - The name of the cookie.
       * @param {string} value - The value of the cookie.
       * @param {CookieOptions} [options] - Additional options like expiration.
       */
      set: (name, value, options) => {
        const cookieHeader = `${name}=${value};${serializeOptions(options || {})}`;
        this.headers.set("Set-Cookie", cookieHeader);
      }
    };
  }
  json(body, ...args) {
    let status = this.#status;
    let headers = {
      "Content-Type": "application/json; charset=utf-8"
    };
    if (typeof args[0] === "number") {
      status = args[0];
      if (typeof args[1] === "object") {
        headers = { ...headers, ...args[1] };
      }
    } else if (typeof args[0] === "object") {
      headers = { ...headers, ...args[0] };
    }
    return this.#handleResponse(JSON.stringify(body), {
      status,
      headers
    });
  }
  send(body, ...args) {
    let status = this.#status;
    let headers = {};
    if (typeof args[0] === "number") {
      status = args[0];
      if (typeof args[1] === "object") {
        headers = args[1];
      }
    } else if (typeof args[0] === "object") {
      headers = args[0];
    }
    if (!headers["Content-Type"]) {
      if (typeof body === "string") {
        headers["Content-Type"] = "text/plain;";
      } else if (typeof body === "object" && body !== null) {
        headers["Content-Type"] = "application/json;";
        body = JSON.stringify(body);
      } else {
        headers["Content-Type"] = "application/octet-stream";
      }
    }
    return this.#handleResponse(body, {
      status,
      headers
    });
  }
  html(data, ...args) {
    let status = this.#status;
    let headers = {
      "Content-Type": "text/html; charset=utf-8"
    };
    if (typeof args[0] === "number") {
      status = args[0];
      if (typeof args[1] === "object") {
        headers = { ...headers, ...args[1] };
      }
    } else if (typeof args[0] === "object") {
      headers = { ...headers, ...args[0] };
    }
    return this.#handleResponse(data, {
      status,
      headers
    });
  }
  text(data, ...args) {
    let status = this.#status;
    let headers = {
      "Content-Type": "text/plain; charset=utf-8"
    };
    if (typeof args[0] === "number") {
      status = args[0];
      if (typeof args[1] === "object") {
        headers = { ...headers, ...args[1] };
      }
    } else if (typeof args[0] === "object") {
      headers = { ...headers, ...args[0] };
    }
    return this.#handleResponse(data, {
      status,
      headers
    });
  }
  xml(data, ...args) {
    let status = this.#status;
    let headers = {
      "Content-Type": "application/xml; charset=utf-8"
    };
    if (typeof args[0] === "number") {
      status = args[0];
      if (typeof args[1] === "object") {
        headers = { ...headers, ...args[1] };
      }
    } else if (typeof args[0] === "object") {
      headers = { ...headers, ...args[0] };
    }
    return this.#handleResponse(data, {
      status,
      headers
    });
  }
  /**
   * HTTP status code..
   * @param status - number.
   * @returns Response object with context all method.
   */
  status = (status) => {
    this.#status = status;
    return this;
  };
  set setStatus(status) {
    this.#status = status;
  }
  get getStatus() {
    return this.#status;
  }
  /**
   * Redirects to a given URL.
   * @param url - The target URL.
   * @param status - (Optional) HTTP status code (default: 302).
   * @returns Response object with redirect.
   */
  redirect(url, status = 302) {
    return new Response(null, {
      status,
      headers: { Location: url }
    });
  }
  /**
   * Handles file downloads.
   * @param filePath - The path to the file.
   * @param fileName - The name of the downloaded file.
   * @returns Response object for file download.
   */
  async download(filePath, fileName) {
    try {
      let fileExists = false;
      const runtime = EnvironmentDetector.getEnvironment;
      if (runtime === "node") {
        const { existsSync } = await import('fs');
        fileExists = existsSync(filePath);
      } else if (runtime === "bun") {
        fileExists = Bun.file(filePath).exists();
      } else if (runtime === "deno") {
        try {
          await Deno.stat(filePath);
          fileExists = true;
        } catch {
          fileExists = false;
        }
      }
      if (!fileExists) {
        throw Error("File not found");
      }
      let fileBuffer;
      if (runtime === "node") {
        const { readFileSync } = await import('fs');
        fileBuffer = await readFileSync(filePath);
      } else if (runtime === "bun") {
        fileBuffer = await Bun.file(filePath).arrayBuffer().then((buf) => new Uint8Array(buf));
      } else if (runtime === "deno") {
        fileBuffer = await Deno.readFile(filePath);
      }
      return this.#handleResponse(fileBuffer, {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Type": "application/octet-stream",
          "Content-Length": fileBuffer.byteLength.toString()
        }
      });
    } catch (error) {
      throw Error("Internal Server Error" + error?.message);
    }
  }
  async sendFile(filePath, ...args) {
    try {
      const runtime = EnvironmentDetector.getEnvironment;
      const resolvedPath = filePath;
      let fileExists = false;
      if (runtime === "node") {
        const { existsSync } = await import('fs');
        fileExists = existsSync(resolvedPath);
      } else if (runtime === "bun") {
        fileExists = Bun.file(resolvedPath).exists();
      } else if (runtime === "deno") {
        try {
          await Deno.stat(resolvedPath);
          fileExists = true;
        } catch {
          fileExists = false;
        }
      }
      if (!fileExists) {
        throw Error("File not found");
      }
      let fileSize = 0;
      if (runtime === "node") {
        const { statSync } = await import('fs');
        fileSize = statSync(resolvedPath).size;
      } else if (runtime === "bun") {
        fileSize = (await Bun.file(resolvedPath).arrayBuffer()).byteLength;
      } else if (runtime === "deno") {
        const fileInfo = await Deno.stat(resolvedPath);
        fileSize = fileInfo.size;
      }
      const ext = filePath.split(".").pop()?.toLowerCase() || "";
      const mimeType = mimeTypes[ext] || defaultMimeType;
      let fileStream;
      if (runtime === "node") {
        const { createReadStream } = await import('fs');
        fileStream = createReadStream(resolvedPath);
      } else if (runtime === "bun") {
        fileStream = Bun.file(resolvedPath).stream();
      } else if (runtime === "deno") {
        const file = await Deno.open(resolvedPath, { read: true });
        fileStream = file.readable;
      }
      let headers = {
        "Content-Type": mimeType,
        "Content-Length": fileSize.toString()
      };
      let fileName = "";
      if (typeof args[0] === "string") {
        fileName = args[0];
        if (typeof args[1] === "object") {
          headers = { ...headers, ...args[1] };
        }
      } else if (typeof args[0] === "object") {
        headers = { ...headers, ...args[0] };
      }
      if (fileName) {
        headers["Content-Disposition"] = `attachment; filename="${fileName}"`;
      }
      return this.#handleResponse(fileStream, {
        status: 200,
        headers
      });
    } catch (error) {
      throw Error("Internal Server Error" + error?.message);
    }
  }
  #handleResponse(body, { headers, status }) {
    let response = new Response(body, {
      status,
      headers
    });
    let clone = response.clone();
    this.res = clone;
    return this.res;
  }
  // get res() {
  //   return this.res;
  // }
  // set res(res: Response) {
  //   this.res = res;
  // }
  /**
   * Getter that creates a standardized Request object from internal state
   * @returns {Request} - Normalized request object combining:
   * - Raw platform-specific request
   * - Parsed headers
   * - Route parameters
   *
   * @example
   * // Get standardized request
   * const request = ctx.req;
   * // Access route params
   * const id = request.params.get('id');
   */
  get req() {
    return new Request(this.#rawRequest, this.params);
  }
  // attachWebSocket(ws) {
  //     this.ws = ws;
  // }
  set params(params) {
    this.#params = params;
  }
  get params() {
    return this.#params;
  }
}
function serializeOptions(options) {
  const parts = [];
  if (options.maxAge) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  if (options.secure) {
    parts.push(`Secure`);
  }
  if (options.httpOnly) {
    parts.push(`HttpOnly`);
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  return parts.join("; ");
}

function useParams({
  path,
  urlPattern
}) {
  let params = {};
  path = path.replace(/^\/+|\/+$/g, "");
  urlPattern = urlPattern.replace(/^\/+|\/+$/g, "");
  const pathSegments = path ? path.split("/") : [];
  const patternSegments = urlPattern ? urlPattern.split("/") : [];
  const pathLength = pathSegments.length;
  const patternLength = patternSegments.length;
  if (pathLength > patternLength && !urlPattern.includes("*")) {
    return { success: false, params: {} };
  }
  let pathIndex = 0;
  for (let i = 0; i < patternLength; i++) {
    const patternSegment = patternSegments[i];
    if (patternSegment?.startsWith("*")) {
      const trailingPatterns = patternSegments.slice(i + 1);
      let paramName = patternSegment.length == 1 ? "*" : patternSegment?.slice(1);
      if (trailingPatterns.length > 0) {
        const expectedTrailing = trailingPatterns.join("/");
        const actualTrailing = pathSegments.slice(pathLength - trailingPatterns.length).join("/");
        const wildcardPath = pathSegments.slice(pathIndex, pathLength - trailingPatterns.length).join("/");
        if (expectedTrailing !== actualTrailing || !wildcardPath) {
          return { success: false, params: {} };
        }
        params[paramName] = wildcardPath;
        return { success: true, params };
      } else {
        const wildcardPath = pathSegments.slice(pathIndex).join("/");
        if (!wildcardPath) {
          return { success: false, params: {} };
        }
        params[paramName] = wildcardPath;
        return { success: true, params };
      }
    }
    if (patternSegment.startsWith(":") && patternSegment.endsWith("?")) {
      const paramName = patternSegment.slice(1, -1);
      const nextPattern = patternSegments[i + 1];
      if (nextPattern && !nextPattern.startsWith(":") && nextPattern !== "*" && pathIndex < pathLength && // !/test == /:user?/test
      // বর্তমান পথ যদি পরবর্তী প্যাটার্ন মানে স্ট্যাটিক পথ এর সাথে মাইল তাহলে
      pathSegments[pathIndex] === nextPattern) {
        params[paramName] = null;
        continue;
      }
      const remainingPatterns = patternSegments.slice(i + 1);
      const requiredCount = remainingPatterns.filter(
        (seg) => !(seg.startsWith(":") && seg.endsWith("?"))
      ).length;
      const remainingPath = pathLength - pathIndex;
      if (remainingPath === requiredCount) {
        params[paramName] = null;
      } else if (pathIndex < pathLength) {
        params[paramName] = pathSegments[pathIndex];
        pathIndex++;
      } else {
        params[paramName] = null;
      }
      continue;
    }
    if (patternSegment.startsWith(":")) {
      const paramName = patternSegment.slice(1);
      if (!/^[a-zA-Z0-9_]+$/.test(paramName)) {
        return { success: false, params: {} };
      }
      if (pathIndex < pathLength) {
        params[paramName] = pathSegments[pathIndex];
        pathIndex++;
      } else {
        return { success: false, params: {} };
      }
      continue;
    }
    const pathSegment = pathSegments[pathIndex];
    if (patternSegment !== pathSegment) {
      return { success: false, params: {} };
    }
    pathIndex++;
  }
  if (pathIndex < pathLength) {
    return { success: false, params: {} };
  }
  return { success: true, params };
}

class TezX extends Router {
  constructor({
    basePath = "/",
    env = {},
    logger = void 0,
    allowDuplicateMw = false,
    overwriteMethod = true
  } = {}) {
    GlobalConfig.allowDuplicateMw = allowDuplicateMw;
    GlobalConfig.overwriteMethod = overwriteMethod;
    if (logger) {
      GlobalConfig.loggerFn = logger;
      GlobalConfig.enableLogger = true;
    }
    super({ basePath, env });
    this.serve = this.serve.bind(this);
  }
  #hashRouter(method, pathname) {
    const routers = this.routers;
    for (let pattern of this.routers.keys()) {
      const { success, params } = useParams({
        path: pathname,
        urlPattern: pattern
      });
      const handlers = routers.get(pattern)?.get(method) || routers.get(pattern)?.get("ALL");
      if (success && handlers) {
        return {
          callback: handlers.callback,
          middlewares: handlers.middlewares,
          params
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
          params
        };
      }
      return null;
    }
    return null;
  }
  findRoute(method, pathname) {
    const route = this.#triRouter(method, pathname) || this.#hashRouter(method, pathname);
    if (route) {
      return {
        ...route,
        middlewares: [...route.middlewares]
      };
    }
    return null;
  }
  #createHandler(middlewares) {
    return async (ctx) => {
      let index = 0;
      const next = async () => {
        await middlewares[index++](ctx, next);
        if (ctx.res) {
          ctx.finalized = true;
          return ctx.res;
        }
      };
      const response = await next();
      if (!response) {
        throw new Error(`Handler did not return a response or next() was not called. Path: ${ctx.pathname}, Method: ${ctx.method}`);
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
  async #handleRequest(req) {
    let ctx = new Context(req);
    const urlRef = ctx.req.urlRef;
    const { pathname } = urlRef;
    let middlewares = this.#findMiddleware(pathname);
    ctx.env = this.env;
    const logger = GlobalConfig.loggerFn();
    if (logger.request) {
      logger.request(ctx.method, ctx.pathname);
    }
    try {
      let callback = async (ctx2) => {
        const find = this.findRoute(ctx2.req.method, pathname);
        if (find?.callback) {
          ctx2.params = find.params;
          const callback2 = find.callback;
          let middlewares2 = find.middlewares;
          return await this.#createHandler([...middlewares2, callback2])(ctx2);
        } else {
          if (logger.response) {
            logger.response(ctx2.method, ctx2.pathname, 404);
          }
          return GlobalConfig.notFound(ctx2);
        }
      };
      let response = await this.#createHandler([...this.triMiddlewares.middlewares, ...middlewares, callback])(ctx);
      let finalCallback = () => {
        return (ctx2) => {
          if (response?.headers) {
            ctx2.headers.add(response.headers);
          }
          const statusText = response?.statusText || httpStatusMap[response?.status] || "";
          const status = response.status || ctx2.getStatus;
          let headers = ctx2.headers.toObject();
          if (logger.response) {
            logger.response(ctx2.method, ctx2.pathname, status);
          }
          return new Response(response.body, {
            status,
            statusText,
            headers
          });
        };
      };
      return finalCallback()(ctx);
    } catch (err) {
      let error = err;
      if (err instanceof Error) {
        error = err.stack;
      }
      if (logger.error) {
        logger.error(`${httpStatusMap[500]}: ${error} `);
      }
      return GlobalConfig.onError(error, ctx);
    }
  }
  async serve(req) {
    return this.#handleRequest(req);
  }
}

function parseEnvFile(filePath, result) {
  try {
    let fileExists = false;
    let runtime = EnvironmentDetector.getEnvironment;
    if (runtime === "node" || runtime === "bun") {
      const { existsSync } = require("fs");
      fileExists = existsSync(filePath);
    } else if (runtime === "deno") {
      try {
        Deno.statSync(filePath);
        fileExists = true;
      } catch {
        fileExists = false;
      }
    }
    if (!fileExists) {
      return;
    }
    let fileContent = "";
    if (runtime === "node" || runtime === "bun") {
      const { readFileSync } = require("fs");
      fileContent = readFileSync(filePath, "utf8");
    } else if (runtime === "deno") {
      fileContent = new TextDecoder("utf-8").decode(
        Deno.readFileSync(filePath)
      );
    }
    const lines = fileContent.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) continue;
      const [key, value] = trimmedLine.split("=", 2).map((part) => part.trim());
      if (key && value) {
        const parsedValue = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
        result[key] = parsedValue;
        if (runtime === "node" || runtime === "bun") {
          process.env[key] = parsedValue;
        } else if (runtime === "deno") {
          Deno.env.set(key, parsedValue);
        }
      }
    }
  } catch (error) {
    console.error(`[dotenv] Error parsing file: ${filePath}`, error);
  }
}
function loadEnv(basePath = "./") {
  const result = {};
  const envFiles = [
    ".env",
    ".env.local",
    `.env.${process?.env?.NODE_ENV || "development"}`,
    // Supports NODE_ENV (e.g., .env.development, .env.production)
    `.env.${process?.env?.NODE_ENV || "development"}.local`
  ];
  for (const envFile of envFiles) {
    parseEnvFile(`${basePath}${envFile}`, result);
  }
  return result;
}

const COLORS = {
  reset: "\x1B[0m",
  bold: "\x1B[1m",
  gray: "\x1B[90m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  bgBlue: "\x1B[44m",
  bgMagenta: "\x1B[45m"};
const loggerOutput = (level, message, ...args) => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const LEVEL_COLORS = {
    info: COLORS.blue,
    warn: COLORS.yellow,
    error: COLORS.red,
    debug: COLORS.cyan,
    success: COLORS.green
  };
  const prefix = `${COLORS.gray}[${timestamp}]${COLORS.reset}`;
  const levelText = `${LEVEL_COLORS[level]}[${level.toUpperCase()}]${COLORS.reset}`;
  console.log(`${prefix} ${levelText} ${message}`, ...args?.flat());
};
function logger() {
  const startTime = performance.now();
  if (GlobalConfig.enableLogger) {
    return {
      request: (method, pathname) => {
        console.log(
          `${COLORS.bold}<-- ${COLORS.reset}${COLORS.bgMagenta} ${method} ${COLORS.reset} ${pathname}`
        );
      },
      response: (method, pathname, status) => {
        const elapsed = performance.now() - startTime;
        console.log(
          `${COLORS.bold}--> ${COLORS.reset}${COLORS.bgBlue} ${method} ${COLORS.reset} ${pathname} ${COLORS.yellow}${status}${COLORS.reset} ${COLORS.magenta}${elapsed.toFixed(2)}ms${COLORS.reset}`
        );
      },
      info: (msg, ...args) => loggerOutput("info", msg, ...args),
      warn: (msg, ...args) => loggerOutput("warn", msg, ...args),
      error: (msg, ...args) => loggerOutput("error", msg, ...args),
      debug: (msg, ...args) => loggerOutput("debug", msg, ...args),
      success: (msg, ...args) => loggerOutput("success", msg, ...args)
    };
  }
  return {
    request: (method, pathname) => {
    },
    response: (method, pathname, status) => {
    },
    info: (msg, ...args) => {
    },
    warn: (msg, ...args) => {
    },
    error: (msg, ...args) => {
    },
    debug: (msg, ...args) => {
    },
    success: (msg, ...args) => {
    }
  };
}

function cors(option = {}) {
  const {
    methods,
    allowedHeaders,
    credentials,
    exposedHeaders,
    maxAge,
    origin
  } = option;
  return async (ctx, next) => {
    const reqOrigin = ctx.req.headers.get("origin") || "";
    let allowOrigin = "*";
    if (typeof origin === "string") {
      allowOrigin = origin;
    } else if (origin instanceof RegExp) {
      allowOrigin = origin.test(reqOrigin) ? reqOrigin : "";
    } else if (Array.isArray(origin)) {
      const isAllowed = origin.some((item) => {
        if (typeof item === "string") {
          return item === reqOrigin;
        } else if (item instanceof RegExp) {
          return item.test(reqOrigin);
        }
      });
      allowOrigin = isAllowed ? reqOrigin : "";
    } else if (typeof origin === "function") {
      allowOrigin = origin(reqOrigin) ? reqOrigin : "";
    }
    ctx.headers.set("Access-Control-Allow-Origin", allowOrigin);
    ctx.headers.set(
      "Access-Control-Allow-Methods",
      (methods || ["GET", "POST", "PUT", "DELETE"]).join(", ")
    );
    ctx.headers.set(
      "Access-Control-Allow-Headers",
      (allowedHeaders || ["Content-Type", "Authorization"]).join(", ")
    );
    if (exposedHeaders) {
      ctx.headers.set(
        "Access-Control-Expose-Headers",
        exposedHeaders.join(", ")
      );
    }
    if (credentials) {
      ctx.headers.set("Access-Control-Allow-Credentials", "true");
    }
    if (maxAge) {
      ctx.headers.set("Access-Control-Max-Age", maxAge.toString());
    }
    if (ctx.req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: ctx.headers.toObject()
      });
    }
    return await next();
  };
}

export { Router, TezX, bunAdapter, cors, denoAdapter, loadEnv, logger, nodeAdapter, useParams };
