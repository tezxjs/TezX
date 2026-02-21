import type { Callback, HTTPMethod, Middleware, RouteMatchResult, RouteRegistry } from "../types/index.js";
import { sanitizePathSplit } from "../utils/url.js";

type RouteParams = Record<string, string | null>;
interface RouteNode {
  children: { [key: string]: RouteNode };
  paramName?: string;
  isOptional?: boolean;
  handlers?: Partial<Record<HTTPMethod, (Callback | Middleware)[]>>;
  isEndpoint?: boolean;
}

/**
 * Radix-based router implementation for efficient route matching.
 * Supports static, dynamic, optional, and wildcard parameters.
 */
export class RadixRouter implements RouteRegistry {
  private root: RouteNode = { children: {} };
  name: string;
  constructor() {
    this.name = "RadixRouter";
  }
  /**
   * Adds a new route to the radix tree.
   *
   * @param method - HTTP method (GET, POST, etc.)
   * @param path - Route path, e.g., "/users/:id?"
   * @param handlers - Array of handler functions or middleware
   * @throws Error if conflicting parameter definitions are detected
   */
  addRoute(
    method: HTTPMethod,
    path: string,
    handlers: (Callback | Middleware)[],
  ) {
    const segments = this.parsePattern(path);

    let node = this.root;

    for (let i = 0; i < segments.length; i++) {
      const { type, value, paramName, isOptional } = segments[i];

      if (type === "static") {
        node = node.children[value!] ??= { children: {} };
      } else if (type === "dynamic") {
        if (!node.children[":"]) {
          node.children[":"] = { children: {}, paramName, isOptional };
        } else if (
          node.children[":"]?.paramName !== paramName ||
          node.children[":"]?.isOptional !== isOptional
        ) {
          throw new Error(`Conflicting param definition for ${paramName}`);
        }
        node = node.children[":"]!;
      } else if (type === "wildcard") {
        node = node.children["*"] ??= { children: {}, paramName };
        // Wildcard must be the last segment
        break;
      }
    }
    node.isEndpoint = true;
    node.handlers ??= {};
    node.handlers[method] ??= [];
    node.handlers[method]!.push(...(handlers || []));
  }

  /**
   * Searches for a route match based on HTTP method and URL path.
   *
   * @param method - HTTP method to match
   * @param path - Request path
   * @returns RouteMatchResult containing handlers, middlewares, and parameters
   */
  search(method: HTTPMethod, path: string): RouteMatchResult {
    let params = {};
    let middlewares: Middleware[] = [];
    const segments = path?.split("/")?.filter(Boolean)
    const { success, node } = this._match(
      method,
      this.root,
      segments,
      0,
      params,
      middlewares,
    );

    const list = node?.handlers?.[method];
    if (success && list) {
      for (let i = 0; i < list.length; i++) {
        middlewares.push(list[i]);
      }
    }

    return { method, params, match: middlewares };
  }
  /**
   * Recursively matches the route path segments.
   *
   * @private
   */
  private _match(
    method: string,
    node: RouteNode,
    segments: string[],
    index: number,
    params: RouteParams,
    middlewares: Middleware[],
  ): { success: boolean; node: RouteNode | undefined } {
    if (node?.handlers?.ALL) {
      const mw = node.handlers?.ALL;
      for (let i = 0; i < mw.length; i++) {
        middlewares.push(mw[i]);
      }
    } // 1. End of path
    if (index === segments.length) {
      if (node.isEndpoint && node.handlers?.[method])
        return { success: true, node };
      const opt = node.children[":"];
      if (opt?.isOptional) {
        params[opt.paramName!] = null;
        return this._match(method, opt, segments, index, params, middlewares);
      }
      return { success: false, node: node };
    }

    const wc = node.children["*"];
    const seg = segments[index];
    // 2. Static
    if (node.children[seg]) {
      const res = this._match(
        method,
        node.children[seg],
        segments,
        index + 1,
        params,
        middlewares,
      );
      if (res.success) {
        if (wc?.handlers?.ALL) {
          const mw = wc.handlers?.ALL;
          for (let i = 0; i < mw.length; i++) {
            middlewares.push(mw[i]);
          }
        }
        return res;
      }
    }

    const dyn = node.children[":"];
    // 3. Dynamic
    if (dyn) {
      params[dyn.paramName!] = seg;
      const res = this._match(
        method,
        dyn,
        segments,
        index + 1,
        params,
        middlewares,
      );
      if (res.success) {
        if (wc?.handlers?.ALL) {
          const mw = wc.handlers?.ALL;
          for (let i = 0; i < mw.length; i++) {
            middlewares.push(mw[i]);
          }
        }
        return res;
      }

      // Optional skip
      if (dyn.isOptional) {
        params[dyn.paramName!] = null;
        const skip = this._match(
          method,
          dyn!,
          segments,
          index, // Don't advance index since we're skipping
          params,
          middlewares,
        );
        if (skip.success) {
          if (wc?.handlers?.ALL) {
            const mw = wc.handlers?.ALL;
            for (let i = 0; i < mw.length; i++) {
              middlewares.push(mw[i]);
            }
          }
          return skip;
        }
      }
    }

    // 3. Try wildcard (can be in middle of path)
    if (wc) {
      let wildcard = segments.slice(index).join("/");
      if (wc?.handlers?.ALL) {
        const mw = wc.handlers?.ALL;
        for (let i = 0; i < mw.length; i++) {
          middlewares.push(mw[i]);
        }
      }
      if (wildcard) {
        params[wc.paramName!] = wildcard;
        return { node: wc, success: true };
      }
    }
    return { success: false, node };
  }
  /**
   * Parses a route pattern into structured segments.
   *
   * @param pattern - The route string (e.g., "/users/:id?")
   * @returns Parsed segments containing type, value, paramName, and optionality
   */
  private parsePattern(pattern: string): Array<{
    type: "static" | "dynamic" | "wildcard";
    value?: string;
    paramName?: string;
    isOptional?: boolean;
  }> {
    // if (pattern === '/') return [{ type: 'static', value: '/' }];
    // Normalize pattern (remove leading/trailing slashes)
    const segments = sanitizePathSplit(pattern);
    // if (normalized === '') return [];
    // const segments = normalized?.length ? normalized : ["/"];

    const result: ReturnType<typeof this.parsePattern> = [];
    for (const segment of segments) {
      if (segment === "*") {
        result.push({ type: "wildcard", paramName: "*" });
        break; // Wildcard must be last
      } else if (segment.startsWith("*")) {
        const paramName = segment.slice(1) || "*";
        result.push({ type: "wildcard", paramName });
        break; // Wildcard must be last
      } else if (segment.startsWith(":")) {
        const isOptional = segment.endsWith("?");
        const paramName = isOptional ? segment.slice(1, -1) : segment.slice(1);
        result.push({ type: "dynamic", paramName, isOptional });
      } else {
        result.push({ type: "static", value: segment });
      }
    }
    return result;
  }
}

// Define test routes
const routes = [
  "/",
  "/users",
  "/users/:id",
  "/users/:id/profile",
  "/posts/:postId?",
  "/files/*",
  "/admin/settings",
  "/search/:term?",
  "/categories/:categoryId/products/:productId",
  "/about",
];

// Add routes

// Define test paths to match
const testPaths = [
  "/",
  "/users",
  "/users/123",
  "/users/123/profile",
  "/posts",
  "/posts/456",
  "/files/path/to/file.txt",
  "/admin/settings",
  "/search",
  "/search/nodejs",
  "/categories/12/products/999",
  "/notfound",
];

const router = new RadixRouter();
let x = function xx() {
  return {
    body: "3453455",
  };
};
// router.addRoute("ALL", "/*", [() => { }]);

// router.addRoute("ALL", "/hello/:h/", [x, x, x, x]);
// router.addRoute("ALL", "/hello/:h/", [x, x, x, x]);

// router.addRoute("GET", "/hello/:h/", [function xx() {
//   return {
//     body: "3453455"
//   }
// }]);
// console.log(router.search('GET', '/hello/f'))
// router.addRoute("GET", "/hello/:h/", [function yy() {
//   return {
//     body: 'ehllo'
//   }
// }]);

for (const route of routes) {
  router.addRoute("GET", route, [() => { }]);
}

// console.log(router)
// Benchmark parameters
const ITERATIONS = 100_000;
const TOTAL_MATCHES = testPaths.length * ITERATIONS;

console.log(
  `Benchmarking ${testPaths.length} routes, ${ITERATIONS} iterations each...`,
);

const start = performance.now();

for (let i = 0; i < ITERATIONS; i++) {
  for (const path of testPaths) {
    router.search("GET", path);
    router.search("ALL", path);
  }
}

const end = performance.now();
const duration = end - start;
function report(name: string, totalOps: number, totalTimeMs: number) {
  const totalTimeNs = totalTimeMs * 1e6; // ms → ns
  const avgNs = totalTimeNs / totalOps;
  const avgUs = avgNs / 1000;
  const opsSec = 1e9 / avgNs;

  console.log(`\n[${name}]`);
  console.log(`  Total ops     : ${totalOps.toLocaleString()}`);
  console.log(`  Total time    : ${totalTimeMs.toFixed(2)} ms`);
  console.log(
    `  Avg per op    : ${avgNs.toFixed(2)} ns (${avgUs.toFixed(6)} µs)`,
  );
  console.log(`  Throughput    : ${opsSec.toFixed(0)} ops/sec`);
}

// Benchmarking 12 routes, 100000 iterations each...

// [RadixRouter.search()]
//   Total ops: 1, 200,000
//   Total time: 170.72 ms
//   Avg per op: 142.26 ns(0.142263 µs)
// Throughput: 7029244 ops / sec
// 🚀 Server running at http://localhost:3002

report("RadixRouter.search()", TOTAL_MATCHES, duration);

console.log(`Completed ${TOTAL_MATCHES} matches in ${duration.toFixed(2)} ms`);
console.log(
  `Average per match: ${((duration / TOTAL_MATCHES) * 1000).toFixed(6)} µs`,
);
